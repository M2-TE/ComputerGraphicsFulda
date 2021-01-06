defaultVS = `
    uniform vec4 modelMatVecs[4];
    uniform vec4 viewMatVecs[4];
    uniform vec4 perspMatVecs[4];

    attribute vec3 pos;
    attribute vec3 color;

    varying vec3 vColor;

    void main() {
        vColor = color;
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

        mat4 perspMat = mat4(
            perspMatVecs[0],
            perspMatVecs[1],
            perspMatVecs[2],
            perspMatVecs[3]);

        vec4 posOut = vec4(pos, 1.0);
        posOut = modelMat * posOut;
        posOut = viewMat * posOut;
        posOut = perspMat * posOut;
        gl_Position = posOut;
    }
`;