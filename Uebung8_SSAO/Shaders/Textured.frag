texturedFS = `
    varying highp vec2 vTexCoord;

    uniform sampler2D texSampler;

    void main() {
        gl_FragColor = texture2D(texSampler, vTexCoord);
    }
`;