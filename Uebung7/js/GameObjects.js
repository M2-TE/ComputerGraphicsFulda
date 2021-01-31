class GameObject {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.transform = new Transform();
        this.material = new Material();
    }

    Destroy() {
        this.posBuffer.Destroy();
        this.colBuffer.Destroy();
        this.indexBuffer.Destroy();
    }
}

class ObjGameObject extends GameObject {
    PassMeshData(mesh, texture) {
        this.texture = texture;
        this.indexCount = mesh.indices.length;

        this.posBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(mesh.vertices),
            this.gl.STATIC_DRAW,
            0, // "pos"
            this.gl.FLOAT, 3);

        var cols = [mesh.vertices.length];
        for (var i = 0; i < mesh.vertices.length; ++i) cols[i] = 0.0;
        this.colBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(cols),
            this.gl.STATIC_DRAW,
            1, // "color"
            this.gl.FLOAT, 3);

        this.normBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(mesh.vertexNormals),
            this.gl.STATIC_DRAW,
            2, // "normal"
            this.gl.FLOAT, 3);

        this.texCoordBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(mesh.textures),
            this.gl.STATIC_DRAW,
            3, // "texCoord"
            this.gl.FLOAT, 2);

        this.indexBuffer = new ConstantBuffer(this.gl,
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(mesh.indices),
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
        this.colBuffer.Bind();
        this.normBuffer.Bind();
        this.texCoordBuffer.Bind();
        this.indexBuffer.Bind();
        this.transform.Bind(this.shaderProgram);
        gl.drawElements(drawMode, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
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

    AssignVerts(vertices, colors, normals, indices) {
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

        this.normBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(normals),
            this.gl.STATIC_DRAW,
            2, // "normal"
            this.gl.FLOAT, 3);

        var fakeUvs = [vertices.length];
        for (var i = 0; i < vertices.length; ++i) fakeUvs[i] = -2.0;
        this.texCoordBuffer = new ConstantBuffer(this.gl,
            this.gl.ARRAY_BUFFER,
            new Float32Array(fakeUvs),
            this.gl.STATIC_DRAW,
            3, // "texCoord"
            this.gl.FLOAT, 2);

        this.indexBuffer = new ConstantBuffer(this.gl,
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            this.gl.STATIC_DRAW);
    }

    static Cube(gl, shaderProgram, color) {
        // unit values
        const unit = 0.5;
        const pnit = -0.5;

        const zero = 0.0;
        const one = 1.0;

        var verts = [
            // top
            pnit, unit, unit, // 0
            unit, unit, unit, // 1
            pnit, unit, pnit, // 2
            unit, unit, pnit, // 3

            // bot
            pnit, pnit, unit, // 4
            unit, pnit, unit, // 5
            pnit, pnit, pnit, // 6
            unit, pnit, pnit, // 7

            // rgt
            unit, unit, unit,
            unit, pnit, unit,
            unit, unit, pnit,
            unit, pnit, pnit,

            // lft
            pnit, pnit, unit,
            pnit, unit, unit,
            pnit, pnit, pnit,
            pnit, unit, pnit,

            // fwd
            pnit, pnit, unit,
            unit, pnit, unit,
            pnit, unit, unit,
            unit, unit, unit,

            // bwd
            pnit, unit, pnit,
            unit, unit, pnit,
            pnit, pnit, pnit,
            unit, pnit, pnit,
        ];

        var cols = [
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,

            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,

            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,

            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,

            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,

            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
        ];

        var normals = [
            // top
            zero, one, zero,
            zero, one, zero,
            zero, one, zero,
            zero, one, zero,

            // bot
            zero, -one, zero,
            zero, -one, zero,
            zero, -one, zero,
            zero, -one, zero,

            // rgt
            one, zero, zero,
            one, zero, zero,
            one, zero, zero,
            one, zero, zero,

            // lft
            -one, zero, zero,
            -one, zero, zero,
            -one, zero, zero,
            -one, zero, zero,

            // fwd
            zero, zero, one,
            zero, zero, one,
            zero, zero, one,
            zero, zero, one,

            // bwd
            zero, zero, -one,
            zero, zero, -one,
            zero, zero, -one,
            zero, zero, -one,
        ];

        var indices = [
            0, 1, 2, 1, 3, 2, // top
            4, 6, 5, 6, 7, 5, // bot
            8, 9, 10, 9, 11, 10, // rgt
            12, 13, 14, 13, 15, 14, // lft
            16, 17, 18, 17, 19, 18, // fwd
            20, 21, 22, 21, 23, 22 // bwd
        ];

        var go = new ColGameObject(gl, shaderProgram);
        go.AssignVerts(verts, cols, normals, indices);
        return go;
    }

    static Sphere(gl, shaderProgram, nLong, nLati, color) {
        const nLongP = nLong + 1, nLatiP = nLati + 1;
        var verts = [];
        var cols = [];
        var normals = [];
        var indices = [];

        for (var lati = 0; lati < nLatiP; ++lati) {
            for (var long = 0; long < nLongP; ++long) {
                const x = Math.sin(Math.PI * lati / nLati) * Math.cos(2 * Math.PI * long / nLong)
                const y = Math.sin(Math.PI * lati / nLati) * Math.sin(2 * Math.PI * long / nLong);
                const z = Math.cos(Math.PI * lati / nLati);
                verts.push(x, y, z);
                normals.push(x, y, z);
                cols.push(color.x, color.y, color.z); // actually using the input color now
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
        go.AssignVerts(verts, cols, normals, indices);
        return go;
    }

    Draw(camera, drawMode) {
        this.shaderProgram.SetActive();

        camera.Bind(this.shaderProgram);
        this.posBuffer.Bind();
        this.colBuffer.Bind();
        this.normBuffer.Bind();
        this.texCoordBuffer.Bind();
        this.indexBuffer.Bind();
        this.transform.Bind(this.shaderProgram);
        gl.drawElements(drawMode, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
}

class Camera {
    constructor(gl, fov, nearClip, farClip) {
        this.gl = gl;
        this.transform = new Transform();
        //this.perspectiveMat = Matrix4x4.Perspective(fov, nearClip, farClip);
        var top = 10;
        var bot = -top;
        var rgt = 10;
        var lft = -rgt;
        this.perspectiveMat = Matrix4x4.Orthographic(lft, rgt, top, bot, nearClip, farClip);
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

class LightsManager {
    constructor(gl) {
        this.gl = gl;
        this.dirLights = [];
        this.pointLights = [];
    }

    AddPointLight(position, color, intensity) {
        this.pointLights.push({
            position: position,
            color: color,
            intensity: intensity,
            enabled: true
        });
    }

    AddDirectionalLight(direction, color, intensity) {
        this.dirLights.push({
            direction: direction,
            color: color,
            intensity: intensity,
            enabled: true
        });
    }

    Bind(shaderProgram) {
        for (var i = 0, length = this.dirLights.length; i < length; ++i) {
            const light = this.dirLights[i];

            var directionLoc = shaderProgram.GetUnifLoc(`directionalLights[${i}].direction`);
            this.gl.uniform3f(directionLoc, light.direction.x, light.direction.y, light.direction.z);

            var colorLoc = shaderProgram.GetUnifLoc(`directionalLights[${i}].color`);
            this.gl.uniform3f(colorLoc, light.color.x, light.color.y, light.color.z);

            var intensityLoc = shaderProgram.GetUnifLoc(`directionalLights[${i}].intensity`);
            this.gl.uniform1f(intensityLoc, light.enabled ? light.intensity : 0.0);
        }

        for (var i = 0, length = this.pointLights.length; i < length; ++i) {
            const light = this.pointLights[i];

            var positionLoc = shaderProgram.GetUnifLoc(`pointLights[${i}].position`);
            this.gl.uniform3f(positionLoc, light.position.x, light.position.y, light.position.z);

            var colorLoc = shaderProgram.GetUnifLoc(`pointLights[${i}].color`);
            this.gl.uniform3f(colorLoc, light.color.x, light.color.y, light.color.z);

            var intensityLoc = shaderProgram.GetUnifLoc(`pointLights[${i}].intensity`);
            this.gl.uniform1f(intensityLoc, light.enabled ? light.intensity : 0.0);
        }
    }
}

class Mouse {
    constructor() {
        this.x = 0.0;
        this.y = 0.0;
        this.xDelta = 0.0;
        this.yDelta = 0.0;
    }

    Update(xMouse, yMouse) {
        // this.xDelta = xMouse - this.x;
        // this.yDelta = yMouse - this.y;
        this.x = xMouse;
        this.y = yMouse;
    }
}