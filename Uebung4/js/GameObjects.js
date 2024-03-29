class GameObject {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.transform = new Transform();
    }

    AssignVertCol(vertices, colors, indices) {
        this.indexCount = indices.length;

        this.posBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            this.gl.STATIC_DRAW,
            0, // "pos"
            this.gl.FLOAT, 2);

        this.colBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(colors),
            this.gl.STATIC_DRAW,
            1, // "color"
            this.gl.FLOAT, 3);

        this.indexBuffer = new ConstantBuffer(this.gl,
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            this.gl.STATIC_DRAW);
    }

    AssignVertTex(vertices, texCoord, indices, texture) {
        this.texture = texture;
        this.indexCount = indices.length;

        this.posBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            this.gl.STATIC_DRAW,
            0, // "pos"
            this.gl.FLOAT, 2);

        this.texCoordBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(texCoord),
            this.gl.STATIC_DRAW,
            1, // "texCoord"
            this.gl.FLOAT, 2);

        this.indexBuffer = new ConstantBuffer(this.gl,
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            this.gl.STATIC_DRAW);
    }

    Destroy() {
        this.posBuffer.Destroy();
        this.colBuffer.Destroy();
        this.indexBuffer.Destroy();
    }

    Draw(camera) {
        this.shaderProgram.SetActive();

        if (typeof this.texture !== "undefined") {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            var loc = this.shaderProgram.GetUnifLoc('texSampler');
            this.gl.uniform1i(loc, 0);

            this.texCoordBuffer.Bind();
        } else {
            this.colBuffer.Bind();
        }

        camera.Bind(this.shaderProgram);
        this.posBuffer.Bind();
        this.indexBuffer.Bind();
        this.transform.Bind(this.shaderProgram);
        gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
}

class Camera {
    constructor(gl, fov, nearClip, farClip) {
        this.gl = gl;
        this.transform = new Transform();
        this.perspectiveMat = Matrix4x4.Perspective(fov, nearClip, farClip);
    }

    Bind(shaderProgram) {
        this.transform.BindAsView(shaderProgram);
        this.perspectiveMat.SetAsUniform(shaderProgram, "perspMatVecs");
    }
}