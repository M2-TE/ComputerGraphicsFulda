texturedVS = `
    uniform vec4 modelMatVecs[4];
    uniform vec4 viewMatVecs[4];

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

        mat4 viewMat = mat4(
            viewMatVecs[0],
            viewMatVecs[1],
            viewMatVecs[2],
            viewMatVecs[3]);

        vec4 posOut = modelMat * pos;
        posOut = viewMat * posOut;
        gl_Position = posOut;
    }
`;