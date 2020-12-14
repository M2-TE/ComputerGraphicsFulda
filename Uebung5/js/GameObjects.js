class GameObject {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.transform = new Transform();
    }

    Destroy() {
        this.posBuffer.Destroy();
        this.colBuffer.Destroy();
        this.indexBuffer.Destroy();
    }
}

class TexGameObject extends GameObject {

    AssignVerts(vertices, texCoord, indices) {
        this.texture = texture;
        this.indexCount = indices.length;

        this.posBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            this.gl.STATIC_DRAW,
            0, // "pos"
            this.gl.FLOAT, 3);

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

    Draw(camera, drawMode) {
        this.shaderProgram.SetActive();

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        var loc = this.shaderProgram.GetUnifLoc('texSampler');
        this.gl.uniform1i(loc, 0);

        camera.Bind(this.shaderProgram);
        this.posBuffer.Bind();
        this.texCoordBuffer.Bind();
        this.indexBuffer.Bind();
        this.transform.Bind(this.shaderProgram);
        gl.drawElements(drawMode, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
}

class ColGameObject extends GameObject {

    AssignVerts(vertices, colors, indices) {
        this.indexCount = indices.length;

        this.posBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            this.gl.STATIC_DRAW,
            0, // "pos"
            this.gl.FLOAT, 3);

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

    static Cube(gl, shaderProgram, color) {
        // unit values
        const unit = 0.5;
        const pnit = -0.5;

        var verts = [
            pnit, unit, unit,
            unit, unit, unit,
            pnit, unit, pnit,
            unit, unit, pnit,
            pnit, pnit, unit,
            unit, pnit, unit,
            pnit, pnit, pnit,
            unit, pnit, pnit];
        var cols = [
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z];
        var indices = [
            0, 1, 2, 1, 3, 2, // top
            4, 6, 5, 6, 7, 5, // bot
            2, 3, 6, 3, 7, 6, // fwd
            1, 0, 5, 0, 4, 5, // bwd
            3, 1, 7, 1, 5, 7, // right
            0, 2, 4, 2, 6, 4];// left

        var go = new ColGameObject(gl, shaderProgram);
        go.AssignVerts(verts, cols, indices);
        return go;
    }

    static Sphere(gl, shaderProgram, nLong, nLati, color) {
        const nLongP = nLong + 1, nLatiP = nLati + 1;
        var verts = [];
        var cols = [];
        var indices = [];

        for (var lati = 0; lati < nLatiP; ++lati) {
            for (var long = 0; long < nLongP; ++long) {
                const x = Math.sin(Math.PI * lati / nLati) * Math.cos(2 * Math.PI * long / nLong)
                const y = Math.sin(Math.PI * lati / nLati) * Math.sin(2 * Math.PI * long / nLong);
                const z = Math.cos(Math.PI * lati / nLati);
                verts.push(x, y, z);
                cols.push(1.0, 0.2, 0.2);
            }
        }
        for (var lati = 0; lati < nLati; ++lati) {
            for (var long = 0; long < nLong; ++long) {
                const latiIndex = lati * nLatiP
                const latiIndexP = (lati + 1) * nLatiP;
                const longIndex = long;
                const longIndexP = long + 1;
                indices.push(
                    latiIndex + longIndex, latiIndex + longIndexP, latiIndexP + longIndex,
                    latiIndex + longIndexP, latiIndexP + longIndexP, latiIndexP + longIndex);
            }
        }

        var go = new ColGameObject(gl, shaderProgram);
        go.AssignVerts(verts, cols, indices);
        return go;
    }

    Draw(camera, drawMode) {
        this.shaderProgram.SetActive();

        camera.Bind(this.shaderProgram);
        this.posBuffer.Bind();
        this.colBuffer.Bind();
        this.indexBuffer.Bind();
        this.transform.Bind(this.shaderProgram);
        gl.drawElements(drawMode, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
}

class Camera {
    constructor(gl, fov, nearClip, farClip) {
        this.gl = gl;
        this.transform = new Transform();
        this.perspectiveMat = Matrix4x4.Perspective(fov, nearClip, farClip);
    }


    GetRight(magnitude) {
        var dirVec = new Vec3(magnitude, 0.0, 0.0);
        dirVec = Vec3.Mul(Matrix4x4.EulerRotationInv(-this.transform.rotEuler.x, -this.transform.rotEuler.y, this.transform.rotEuler.z), dirVec);
        return dirVec;
    }

    GetUp(magnitude) {
        var dirVec = new Vec3(0.0, magnitude, 0.0);
        dirVec = Vec3.Mul(Matrix4x4.EulerRotationInv(-this.transform.rotEuler.x, -this.transform.rotEuler.y, this.transform.rotEuler.z), dirVec);
        return dirVec;
    }

    GetFwd(magnitude) {
        var dirVec = new Vec3(0.0, 0.0, magnitude);
        dirVec = Vec3.Mul(Matrix4x4.EulerRotationInv(-this.transform.rotEuler.x, -this.transform.rotEuler.y, this.transform.rotEuler.z), dirVec);
        return dirVec;
    }

    Bind(shaderProgram) {
        this.transform.BindAsView(shaderProgram);
        this.perspectiveMat.SetAsUniform(shaderProgram, "perspMatVecs");
    }
}