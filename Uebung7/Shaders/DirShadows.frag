dirShadowsFS = `
    precision highp float;
    
    void main() {
        float ndcZ = (gl_FragCoord.z / gl_FragCoord.w + 1.0) / 2.0;
        float depthValue = ndcZ / 4.0;
        depthValue = gl_FragCoord.z * 100.0;
        gl_FragColor = vec4(depthValue, depthValue, depthValue, 1.0);
    }
`;