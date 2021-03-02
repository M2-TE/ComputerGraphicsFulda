vertexBufferVS = `
    precision highp float;

    uniform vec4 modelMatVecs[4];
    uniform vec4 viewMatVecs[4];
    uniform vec4 perspMatVecs[4];

    attribute vec3 pos;
    attribute vec3 color;
    attribute vec3 normal;
    attribute vec2 texCoord;

    varying vec3 vNormal;
    varying vec3 vCol;
    varying vec3 vWorldPos;

    void main() {
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

        vNormal = normalize((modelMat * vec4(normal, 0.0)).xyz);
        vCol = color;

        gl_Position = vec4(pos, 1.0);
        gl_Position = modelMat * gl_Position;
        vWorldPos = gl_Position.xyz;

        gl_Position = viewMat * gl_Position;
        gl_Position = perspMat * gl_Position;
    }
`;