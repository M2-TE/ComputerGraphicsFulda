class Transform {
    constructor() {
        this.position = new Vec3(0, 0, 0);
        this.rotEuler = new Vec3(0, 0, 0);
        this.scale = new Vec3(1, 1, 1);
    }

    Bind(shaderProgram) {
        var translationMat =
            Matrix4x4.Translation(
                this.position.x,
                this.position.y,
                this.position.z);

        var rotationMat =
            Matrix4x4.EulerRotation(
                this.rotEuler.x,
                this.rotEuler.y,
                this.rotEuler.z);

        var scaleMat =
            Matrix4x4.Scale(
                this.scale.x,
                this.scale.y,
                this.scale.z);

        // first scale, then rotate, then translate
        var res = Matrix4x4.Mul(Matrix4x4.Mul(scaleMat, rotationMat), translationMat);
        res.SetAsUniform(shaderProgram, "modelMatVecs");
    }
};