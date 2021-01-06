phongFS = `
    precision highp float;

    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec4 vColor;
    varying vec3 vAmbientCol;

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0) - vWorldPos);
        float diffuse = max(dot(normal, lightDir), 0.0);
        vec3 diffuseCol = vColor.rgb * diffuse;

        //currently debug, later uniform
        vec3 camPos = vec3(0.0, 0.0, -10.0);
        vec3 lightColor = vec3(1.0, 1.0, 1.0);
        float specularIntensity = .4;
        float lightIntensity = 1.0;
        float shininess = 30.0;
        ////////

        vec3 camDir =  normalize(camPos - vWorldPos);
        vec3 lightReflect = reflect(lightDir, normal);
        float specular = lightIntensity * specularIntensity * pow(max(dot(lightReflect, camDir), 0.0), shininess);
        vec3 specularCol = lightColor * specular;

        gl_FragColor = vec4(diffuseCol + specularCol + vAmbientCol, vColor.w);
    }
`;