phongFS = `
    precision highp float;
    
    struct PointLight {
        vec3 position;
        vec3 color;
        float intensity;
    };

    struct DirectionalLight {
        vec3 direction;
        vec3 color;
        float intensity;
        float shadowmapDim;
        vec4 viewPerspMatVecs[4];
    };

    const int dirLightCount = 1;
    const int pointLightCount = 2;
    
    uniform sampler2D texSampler[1 + dirLightCount];
    uniform DirectionalLight directionalLights[dirLightCount];
    uniform PointLight pointLights[pointLightCount];
    uniform vec3 cameraPos;
    uniform vec3 ambient;

    // ssao
    uniform sampler2D vertexBuffer;
    uniform sampler2D normalBuffer;
    uniform sampler2D sampleNoise;
    const float ssaoRadius = 1.5;
    const float ssaoBias = 0.025;
    const int numSamples = 64;
    uniform vec3 sampleOffsets[numSamples];
    const vec2 screenDim = vec2(400.0, 400.0);
    const float noiseTexDim = 4.0;
    const vec2 noiseSamplerScale = vec2(screenDim.x / noiseTexDim, screenDim.y / noiseTexDim); 

    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec4 vColor;
    varying vec2 vTexCoord;
    varying mat4 perspMat;
    varying mat4 viewMat;

    vec3 CalcDirectionalLightCol(DirectionalLight light, vec3 color) 
    {
        // shadow
        mat4 viewPerspMat = mat4(
            light.viewPerspMatVecs[0],
            light.viewPerspMatVecs[1],
            light.viewPerspMatVecs[2],
            light.viewPerspMatVecs[3]);

        vec4 fragCoordLight = viewPerspMat * vec4(vWorldPos, 1.0);
        float texDim = light.shadowmapDim;
        vec2 uv = vec2((fragCoordLight.x + 1.0) / 2.0, (fragCoordLight.y + 1.0) / 2.0);
        float lightDepth = texture2D(texSampler[1], uv).x;
        if(lightDepth < fragCoordLight.z) return vec3(0.0, 0.0, 0.0);

        // diffuse
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(light.direction);
        float diffuse = max(dot(normal, -lightDir), 0.0) * light.intensity;

        // specular
        vec3 camDir =  normalize(cameraPos - vWorldPos);
        vec3 lightReflect = reflect(lightDir, normal);
        const float specularIntensity = .5;
        const float shininess = 20.0;
        float specular = light.intensity * specularIntensity * pow(max(dot(lightReflect, camDir), 0.0), shininess);

        return color * light.color * diffuse + light.color * specular;
    }

    vec3 CalcPointLightCol(PointLight light, vec3 color)
    {
        // diffuse
        vec3 normal = normalize(vNormal);
        vec3 lightVec = light.position - vWorldPos;
        vec3 lightDir = normalize(lightVec);
        
        float dist = length(lightVec);
        float attenuation = 1.0 / (0.1 + 0.1 * dist + 1.0 * dist * dist);
        float diffuse = max(dot(normal, lightDir), 0.0) * attenuation * light.intensity;

        // specular
        vec3 camDir =  normalize(cameraPos - vWorldPos);
        vec3 lightReflect = reflect(-lightDir, normal);
        const float specularIntensity = .5;
        const float shininess = 20.0;
        float specular = light.intensity * specularIntensity * pow(max(dot(lightReflect, camDir), 0.0), shininess) * attenuation;

        return color * light.color * diffuse + light.color * specular;
    }

    void main() {
        vec3 resultCol = vec3(0.0, 0.0, 0.0);
        float resultAlpha = vColor.a;

        vec3 color = vec3(0.0, 0.0, 0.0);
        if (vTexCoord.x > -1.0) {
            vec4 sample = texture2D(texSampler[0], vTexCoord);
            color = sample.rgb;
            resultAlpha = sample.a;
            if(resultAlpha < 0.001) discard;
        } else {
            color = vColor.rgb;
        }

        for(int i = 0; i < dirLightCount; ++i)
        {
            resultCol += CalcDirectionalLightCol(directionalLights[i], color);
        }

        for(int i = 0; i < pointLightCount; ++i)
        {
            resultCol += CalcPointLightCol(pointLights[i], color);
        }



        // SSAO:
        vec3 viewPos =  (viewMat * vec4(vWorldPos, 1.0)).xyz;
        //vec3 viewPos = texture2D(vertexBuffer, gl_FragCoord.xy / 400.0).xyz;
        vec3 normal = mat3(viewMat) * vNormal; // needs to be in view space
        //vec3 normal = texture2D(normalBuffer, gl_FragCoord.xy / 400.0).xyz;
        vec3 noiseVec = texture2D(sampleNoise, gl_FragCoord.xy * 1.0).xyz;

        // creating TBN matrix:
        vec3 tangent = normalize(noiseVec - normal * dot(noiseVec, normal));
        vec3 bitangent = cross(normal, tangent);
        mat3 TBN = mat3(tangent, bitangent, normal);

        // calculate occlusion value
        float occlusion = 0.0;
        for(int i = 0; i < numSamples; ++i)
        {
            // convert offset sample from tangent to view space
            vec4 samplePos = vec4(viewPos + (TBN * sampleOffsets[i]) * ssaoRadius, 1.0);
            

            // and lastly screen space with perspective divide and normalization
            vec4 offset = perspMat * samplePos;
            offset.xyz /= offset.w;
            offset.xyz = offset.xyz * 0.5 + 0.5;

            // use offset to read worldPos texture
            vec4 realPos = texture2D(vertexBuffer, offset.xy);
            // transform to view space
            realPos = viewMat * realPos;

            float rangeCheck = smoothstep(0.0, 1.0, ssaoRadius / abs(viewPos.z - realPos.z));
            occlusion += realPos.z >= samplePos.z + ssaoBias ? rangeCheck : 0.0;
        }
        occlusion /= float(numSamples);
        
        gl_FragColor = vec4((resultCol + ambient) * (1.0 - occlusion), resultAlpha);
    }
`;