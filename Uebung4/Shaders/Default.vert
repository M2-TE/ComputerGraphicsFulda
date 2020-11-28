defaultVS = `
    uniform vec4 modelMatVecs[4];

    attribute vec4 pos;
    attribute vec3 color;

    varying vec3 vColor;

    void main() {
        vColor = color;
        mat4 modelMat = mat4(
            modelMatVecs[0],
            modelMatVecs[1],
            modelMatVecs[2],
            modelMatVecs[3]);

        // since its column major, pos vec on the right
        gl_Position = modelMat * pos;
    }
`;