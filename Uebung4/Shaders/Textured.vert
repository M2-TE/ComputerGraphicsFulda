texturedVS = `
    uniform vec4 modelMatVecs[4];

    attribute vec4 pos;
    attribute vec2 texCoord;

    varying highp vec2 vTexCoord;

    void main() {
        vTexCoord = texCoord;

        mat4 modelMat = mat4(
            modelMatVecs[0],
            modelMatVecs[1],
            modelMatVecs[2],
            modelMatVecs[3]);

        gl_Position = modelMat * pos;
    }
`;