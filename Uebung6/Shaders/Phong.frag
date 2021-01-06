phongFS = `
    precision highp float;

    varying vec4 vColor;
    varying vec4 vWorldPos;
    varying vec3 vNormal;
    varying vec3 vAmbientCol;

    void main() {
        vec3 lightDir = vec3(5.0, 5.0, 5.0) - vWorldPos.xyz;
        float diffuse = max(dot(normalize(vNormal), normalize(lightDir)), 0.0);

        gl_FragColor = vec4(vColor.xyz * diffuse, vColor.w);
    }
`;