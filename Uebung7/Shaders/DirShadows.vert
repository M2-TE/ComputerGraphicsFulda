dirShadowsVS = `
    precision highp float;

    uniform vec4 modelMatVecs[4];
    uniform vec4 viewMatVecs[4];
    uniform vec4 perspMatVecs[4];

    attribute vec3 pos;

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
    	
        gl_Position = vec4(pos, 1.0);
        gl_Position = modelMat * gl_Position;
        gl_Position = viewMat * gl_Position;
        gl_Position = perspMat * gl_Position;
    }
`;