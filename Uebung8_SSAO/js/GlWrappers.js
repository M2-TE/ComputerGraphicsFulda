class ConstantBuffer {
    constructor(gl, type, data, usage, attribLoc, attribType, attribLen) {
        this.gl = gl;
        this.type = type;
        this.data = data;
        this.usage = usage;

        this.attribType = attribType;
        this.attribLen = attribLen;
        this.attribLoc = attribLoc

        this.buffer = gl.createBuffer();
        this.Update(type, data, usage);
    }

    // why the fuck are there no destructors in javascript
    Destroy() {
        this.gl.deleteBuffer(this.buffer);
    }

    Update(type, data, usage) {
        this.gl.bindBuffer(type, this.buffer);
        this.gl.bufferData(type, data, usage);
    }

    Bind() {
        this.gl.bindBuffer(this.type, this.buffer);
        if (this.attribType) this.EnableInputLayout();
    }

    EnableInputLayout() {
        this.gl.vertexAttribPointer(this.attribLoc, this.attribLen, this.attribType, false, 0, 0);
        this.gl.enableVertexAttribArray(this.attribLoc);
    }

    DisableInputLayout() {
        this.gl.disableVertexAttribArray(this.attribLoc);
    }
}

class ShaderProgram {
    constructor(gl, vsSource, fsSource) {
        function createShader(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        function createProgram(gl, vsSource, fsSource) {
            var vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
            var fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

            if (vs && fs) {
                var program = gl.createProgram();
                gl.attachShader(program, vs);
                gl.attachShader(program, fs);
                gl.linkProgram(program);

                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.warn("Could not	link program: " + gl.getProgramInfoLog(program));
                    return null;
                }
                return program;
            }
            return null;
        };

        this.gl = gl;
        this.program = createProgram(gl, vsSource, fsSource);
    }

    Destroy() {
        var shaders = this.gl.getAttachedShaders(this.program);
        for (var i = 0; i < shaders.length; ++i) {
            var shader = shaders[i];
            gl.detachShader(this.program, shader);
            gl.deleteShader(shader);
        }
        gl.deleteProgram(this.shaderProgram);
    }

    GetUnifLoc(unifName) {
        return this.gl.getUniformLocation(this.program, unifName);
    }

    GetAttrLoc(attrName) {
        return this.gl.getAttribLocation(this.program, attrName);
    }

    SetActive() {
        this.gl.useProgram(this.program)
    }
}

function loadTexture(gl, path) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
        gl.UNSIGNED_BYTE, new Uint8Array([100, 100, 100, 255]));

    var image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        function isPowerOf2(value) {
            return (value & (value - 1)) == 0;
        }

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    }
    image.src = path;

    return texture;
}


class Texture2D {
    constructor(gl, dim, repeatMode, pixelArray) {

        this.gl = gl;
        this.dim = dim;

        repeatMode = repeatMode == null ? gl.CLAMP_TO_EDGE : repeatMode;

        // create texture
        this.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, dim, dim, 0, gl.RGBA, gl.FLOAT, pixelArray);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeatMode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeatMode);
        gl.bindTexture(gl.TEXTURE_2D, null);

        // create renderbuffer
        this.rb = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, dim, dim);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        // create framebuffer
        this.fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.rb);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // check for errors
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status != gl.FRAMEBUFFER_COMPLETE) { console.log("Framebuffer error"); };
    }

    BindAsFBO() {
        this.gl.viewport(0, 0, this.dim, this.dim);
        this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    BindAsSampler(program, uniformName, textureUnitOffset) {
        var loc = program.GetUnifLoc(uniformName);
        var textureUnit = textureUnitOffset + 5;

        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);

        this.gl.uniform1i(loc, textureUnit);
    }

    UnbindAsSampler(program, uniformName, textureUnitOffset) {
        var loc = program.GetUnifLoc(uniformName);
        var textureUnit = textureUnitOffset + 5;

        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
}
