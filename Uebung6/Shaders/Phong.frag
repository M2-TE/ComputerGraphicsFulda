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
    };

    const int dirLightCount = 1;
    const int pointLightCount = 2;
    
    uniform DirectionalLight directionalLights[dirLightCount];
    uniform PointLight pointLights[pointLightCount];
    uniform vec3 cameraPos;
    uniform vec3 ambient;

    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec4 vColor;

    vec3 CalcDirectionalLightCol(DirectionalLight light) 
    {
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

        return vColor.rgb * light.color * diffuse + light.color * specular;
    }

    vec3 CalcPointLightCol(PointLight light)
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

        return vColor.rgb * light.color * diffuse + light.color * specular;
    }

    void main() {
        vec3 resultCol = vec3(0.0, 0.0, 0.0);

        for(int i = 0; i < dirLightCount; ++i)
        {
            resultCol += CalcDirectionalLightCol(directionalLights[i]);
        }

        for(int i = 0; i < pointLightCount; ++i)
        {
            resultCol += CalcPointLightCol(pointLights[i]);
        }

        gl_FragColor = vec4(resultCol + ambient, vColor.w);
    }
`;