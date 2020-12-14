class Matrix4x4 {
    constructor(a, b, c, d) {
        this.vals = [a, b, c, d];
    }

    SetAsUniform(shaderProgram, uniformArrName) {
        var col0 = shaderProgram.GetUnifLoc(`${uniformArrName}[0]`);
        var col1 = shaderProgram.GetUnifLoc(`${uniformArrName}[1]`);
        var col2 = shaderProgram.GetUnifLoc(`${uniformArrName}[2]`);
        var col3 = shaderProgram.GetUnifLoc(`${uniformArrName}[3]`);

        gl.uniform4f(col0, this.vals[0][0], this.vals[0][1], this.vals[0][2], this.vals[0][3]);
        gl.uniform4f(col1, this.vals[1][0], this.vals[1][1], this.vals[1][2], this.vals[1][3]);
        gl.uniform4f(col2, this.vals[2][0], this.vals[2][1], this.vals[2][2], this.vals[2][3]);
        gl.uniform4f(col3, this.vals[3][0], this.vals[3][1], this.vals[3][2], this.vals[3][3]);
    }

    static Perspective(fov, nearClip, farClip) {
        var fovMod = 1 / Math.tan((fov / 2) * (Math.PI / 180));
        var clipA = -(farClip / (farClip - nearClip));
        var clipB = -((farClip * nearClip) / (farClip - nearClip));
        var colA = [fovMod, 0, 0, 0];
        var colB = [0, fovMod, 0, 0];
        var colC = [0, 0, clipA, -1];
        var colD = [0, 0, clipB, 0];
        return new Matrix4x4(colA, colB, colC, colD);
    }

    static Translation(x, y, z) {
        var colA = [1, 0, 0, 0];
        var colB = [0, 1, 0, 0];
        var colC = [0, 0, 1, 0];
        var colD = [x, y, z, 1];
        return new Matrix4x4(colA, colB, colC, colD);
    }

    static EulerRotation(x, y, z) {
        // roll
        var colA = [1, 0, 0, 0];
        var colB = [0, Math.cos(x), -Math.sin(x), 0];
        var colC = [0, Math.sin(x), Math.cos(x), 0];
        var colD = [0, 0, 0, 1];
        var xRotMat = new Matrix4x4(colA, colB, colC, colD);

        // pitch
        var colA = [Math.cos(y), 0, Math.sin(y), 0];
        var colB = [0, 1, 0, 0];
        var colC = [-Math.sin(y), 0, Math.cos(y), 0];
        var colD = [0, 0, 0, 1];
        var yRotMat = new Matrix4x4(colA, colB, colC, colD);

        // yaw
        var colA = [Math.cos(z), -Math.sin(z), 0, 0];
        var colB = [Math.sin(z), Math.cos(z), 0, 0];
        var colC = [0, 0, 1, 0];
        var colD = [0, 0, 0, 1];
        var zRotMat = new Matrix4x4(colA, colB, colC, colD);

        return Matrix4x4.Mul(Matrix4x4.Mul(xRotMat, yRotMat), zRotMat);
        // return Matrix4x4.Mul(Matrix4x4.Mul(zRotMat, yRotMat), xRotMat);
    }

    static EulerRotationInv(x, y, z) {
        // roll
        var colA = [1, 0, 0, 0];
        var colB = [0, Math.cos(x), -Math.sin(x), 0];
        var colC = [0, Math.sin(x), Math.cos(x), 0];
        var colD = [0, 0, 0, 1];
        var xRotMat = new Matrix4x4(colA, colB, colC, colD);

        // pitch
        var colA = [Math.cos(y), 0, Math.sin(y), 0];
        var colB = [0, 1, 0, 0];
        var colC = [-Math.sin(y), 0, Math.cos(y), 0];
        var colD = [0, 0, 0, 1];
        var yRotMat = new Matrix4x4(colA, colB, colC, colD);

        // yaw
        var colA = [Math.cos(z), -Math.sin(z), 0, 0];
        var colB = [Math.sin(z), Math.cos(z), 0, 0];
        var colC = [0, 0, 1, 0];
        var colD = [0, 0, 0, 1];
        var zRotMat = new Matrix4x4(colA, colB, colC, colD);

        return Matrix4x4.Mul(Matrix4x4.Mul(zRotMat, yRotMat), xRotMat);
    }

    static Scale(x, y, z) {
        var colA = [x, 0, 0, 0];
        var colB = [0, y, 0, 0];
        var colC = [0, 0, z, 0];
        var colD = [0, 0, 0, 1];
        return new Matrix4x4(colA, colB, colC, colD);
    }

    static Mul(A, B) {
        var colA = [
            A.vals[0][0] * B.vals[0][0] + A.vals[0][1] * B.vals[1][0] + A.vals[0][2] * B.vals[2][0] + A.vals[0][3] * B.vals[3][0],
            A.vals[0][0] * B.vals[0][1] + A.vals[0][1] * B.vals[1][1] + A.vals[0][2] * B.vals[2][1] + A.vals[0][3] * B.vals[3][1],
            A.vals[0][0] * B.vals[0][2] + A.vals[0][1] * B.vals[1][2] + A.vals[0][2] * B.vals[2][2] + A.vals[0][3] * B.vals[3][2],
            A.vals[0][0] * B.vals[0][3] + A.vals[0][1] * B.vals[1][3] + A.vals[0][2] * B.vals[2][3] + A.vals[0][3] * B.vals[3][3]];

        var colB = [
            A.vals[1][0] * B.vals[0][0] + A.vals[1][1] * B.vals[1][0] + A.vals[1][2] * B.vals[2][0] + A.vals[1][3] * B.vals[3][0],
            A.vals[1][0] * B.vals[0][1] + A.vals[1][1] * B.vals[1][1] + A.vals[1][2] * B.vals[2][1] + A.vals[1][3] * B.vals[3][1],
            A.vals[1][0] * B.vals[0][2] + A.vals[1][1] * B.vals[1][2] + A.vals[1][2] * B.vals[2][2] + A.vals[1][3] * B.vals[3][2],
            A.vals[1][0] * B.vals[0][3] + A.vals[1][1] * B.vals[1][3] + A.vals[1][2] * B.vals[2][3] + A.vals[1][3] * B.vals[3][3]];

        var colC = [
            A.vals[2][0] * B.vals[0][0] + A.vals[2][1] * B.vals[1][0] + A.vals[2][2] * B.vals[2][0] + A.vals[2][3] * B.vals[3][0],
            A.vals[2][0] * B.vals[0][1] + A.vals[2][1] * B.vals[1][1] + A.vals[2][2] * B.vals[2][1] + A.vals[2][3] * B.vals[3][1],
            A.vals[2][0] * B.vals[0][2] + A.vals[2][1] * B.vals[1][2] + A.vals[2][2] * B.vals[2][2] + A.vals[2][3] * B.vals[3][2],
            A.vals[2][0] * B.vals[0][3] + A.vals[2][1] * B.vals[1][3] + A.vals[2][2] * B.vals[2][3] + A.vals[2][3] * B.vals[3][3]];

        var colD = [
            A.vals[3][0] * B.vals[0][0] + A.vals[3][1] * B.vals[1][0] + A.vals[3][2] * B.vals[2][0] + A.vals[3][3] * B.vals[3][0],
            A.vals[3][0] * B.vals[0][1] + A.vals[3][1] * B.vals[1][1] + A.vals[3][2] * B.vals[2][1] + A.vals[3][3] * B.vals[3][1],
            A.vals[3][0] * B.vals[0][2] + A.vals[3][1] * B.vals[1][2] + A.vals[3][2] * B.vals[2][2] + A.vals[3][3] * B.vals[3][2],
            A.vals[3][0] * B.vals[0][3] + A.vals[3][1] * B.vals[1][3] + A.vals[3][2] * B.vals[2][3] + A.vals[3][3] * B.vals[3][3]];
        return new Matrix4x4(colA, colB, colC, colD);
    }
}

class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static Mul(mat, vec) {
        const x = mat.vals[0][0] * vec.x + mat.vals[0][1] * vec.y + mat.vals[0][2] * vec.z;
        const y = mat.vals[1][0] * vec.x + mat.vals[1][1] * vec.y + mat.vals[1][2] * vec.z;
        const z = mat.vals[2][0] * vec.x + mat.vals[2][1] * vec.y + mat.vals[2][2] * vec.z;
        return new Vec3(x, y, z);
    }

    static Add(a, b) {
        return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
    }
}