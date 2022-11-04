/**
 * @summary     ThreeDWgt
 * @description It threeD based on WebGL.
 * @version     2.0.0
 * @file        nemo.threeD.js
 * @author      Bhaskar Mangal ( bhaskar@vidteq.com )
 * @contact     www.vidteq.com
 *
 * @copyright Copyright 2014-2015 www.vidteq.com, all rights reserved.
 */
(function( global,document, root ) {

root = global[root] = ( global[root]? global[root] : {} );
var Type = Object.freeze? Object.freeze({ "CUBE":1, "SPHERE":2 }) : { "CUBE":1, "SPHERE":2 };
var light = {
   DirectionalLight:[]
  ,SpotLight:[]
  ,PointLight:[]
  ,AmbientLight:[]
};

//-- SHADERS
//References:
// http://threejs.org/examples/#webgl_postprocessing
// http://threejs.org/examples/#webgl_postprocessing_advanced
 function Shaders( options ) {
    options = options || {};
  }
  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Bleach bypass shader [http://en.wikipedia.org/wiki/Bleach_bypass]
   * - based on Nvidia example
   * http://developer.download.nvidia.com/shaderlibrary/webpages/shader_library.html#post_bleach_bypass
   */
  //author Lee Stemkoski   http://www.adelphi.edu/~stemkoski/
  // attribute: data that may be different for each particle (such as size and color);
  // can only be used in vertex shader
  // varying: used to communicate data from vertex shader to fragment shader
  // uniform: data that is the same for each particle (such as texture)
  Shaders.ParticleShader = function() {
    return {
      vertexShader:[
        "attribute vec3  customColor;",
        "attribute float customOpacity;",
        "attribute float customSize;",
        "attribute float customAngle;",
        "attribute float customVisible;",  // float used as boolean (0 = false, 1 = true)
        "varying vec4  vColor;",
        "varying float vAngle;",
        "void main()",
        "{",
          "if ( customVisible > 0.5 )", 				// true
            "vColor = vec4( customColor, customOpacity );", //     set color associated to vertex; use later in fragment shader.
          "else",							// false
            "vColor = vec4(0.0, 0.0, 0.0, 0.0);", 		//     make particle invisible.
            
          "vAngle = customAngle;",

          "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
          "gl_PointSize = customSize * ( 300.0 / length( mvPosition.xyz ) );",     // scale particles as objects in 3D space
          "gl_Position = projectionMatrix * mvPosition;",
        "}"
      ].join("\n")
      ,fragmentShader:[
        "uniform sampler2D texture;",
        "varying vec4 vColor;", 	
        "varying float vAngle;",   
        "void main()", 
        "{",
          "gl_FragColor = vColor;",
          
          "float c = cos(vAngle);",
          "float s = sin(vAngle);",
          "vec2 rotatedUV = vec2(c * (gl_PointCoord.x - 0.5) + s * (gl_PointCoord.y - 0.5) + 0.5,", 
                                "c * (gl_PointCoord.y - 0.5) - s * (gl_PointCoord.x - 0.5) + 0.5);",  // rotate UV coordinates to rotate texture
              "vec4 rotatedTexture = texture2D( texture,  rotatedUV );",
          "gl_FragColor = gl_FragColor * rotatedTexture;",    // sets an otherwise white particle texture to desired color
        "}"
      ].join("\n")
    };
  }
  Shaders.BleachBypassShader = function() {
    return {
      uniforms: {
        "tDiffuse": { type: "t", value: null },
        "opacity":  { type: "f", value: 1.0 }
      },
      vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform float opacity;",
        "uniform sampler2D tDiffuse;",
        "varying vec2 vUv;",
        "void main() {",
          "vec4 base = texture2D( tDiffuse, vUv );",
          "vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );",
          "float lum = dot( lumCoeff, base.rgb );",
          "vec3 blend = vec3( lum );",
          "float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );",
          "vec3 result1 = 2.0 * base.rgb * blend;",
          "vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );",
          "vec3 newColor = mix( result1, result2, L );",
          "float A2 = opacity * base.a;",
          "vec3 mixRGB = A2 * newColor.rgb;",
          "mixRGB += ( ( 1.0 - A2 ) * base.rgb );",
          "gl_FragColor = vec4( mixRGB, base.a );",
        "}"
      ].join("\n")
    };
  }

  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Film grain & scanlines shader
   *
   * - ported from HLSL to WebGL / GLSL
   * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
   *
   * Screen Space Static Postprocessor
   *
   * Produces an analogue noise overlay similar to a film grain / TV static
   *
   * Original implementation and noise algorithm
   * Pat 'Hawthorne' Shearon
   *
   * Optimized scanlines + noise version with intensity scaling
   * Georg 'Leviathan' Steinrohder
   *
   * This version is provided under a Creative Commons Attribution 3.0 License
   * http://creativecommons.org/licenses/by/3.0/
   */
  Shaders.FilmShader = function() {
    return {
      uniforms: {
        "tDiffuse":   { type: "t", value: null },
        "time":       { type: "f", value: 0.0 },
        "nIntensity": { type: "f", value: 0.5 },
        "sIntensity": { type: "f", value: 0.05 },
        "sCount":     { type: "f", value: 4096 },
        "grayscale":  { type: "i", value: 1 }
      },
      vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join("\n"),
      fragmentShader: [
        // control parameter
        "uniform float time;",
        "uniform bool grayscale;",
        // noise effect intensity value (0 = no effect, 1 = full effect)
        "uniform float nIntensity;",
        // scanlines effect intensity value (0 = no effect, 1 = full effect)
        "uniform float sIntensity;",
        // scanlines effect count value (0 = no effect, 4096 = full effect)
        "uniform float sCount;",
        "uniform sampler2D tDiffuse;",
        "varying vec2 vUv;",
        "void main() {",
          // sample the source
          "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",
          // make some noise
          "float x = vUv.x * vUv.y * time *  1000.0;",
          "x = mod( x, 13.0 ) * mod( x, 123.0 );",
          "float dx = mod( x, 0.01 );",
          // add noise
          "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",
          // get us a sine and cosine
          "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",
          // add scanlines
          "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",
          // interpolate between source and result by intensity
          "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",
          // convert to grayscale if desired
          "if( grayscale ) {",
            "cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",
          "}",
          "gl_FragColor =  vec4( cResult, cTextureScreen.a );",
        "}"
      ].join("\n")
    };
  }

  /**
   * @author zz85 / http://www.lab4games.net/zz85/blog
   *
   * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
   * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
   *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
   *
   * - 9 samples per pass
   * - standard deviation 2.7
   * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
   */
  Shaders.HorizontalBlurShader = function() {
    return {
      uniforms: {
        "tDiffuse": { type: "t", value: null },
        "h":        { type: "f", value: 1.0 / 512.0 }
      },
      vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform float h;",
        "varying vec2 vUv;",
        "void main() {",
          "vec4 sum = vec4( 0.0 );",
          "sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
          "sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
          "sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
          "sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
          "sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
          "sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
          "sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
          "sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",
          "gl_FragColor = sum;",
        "}"
      ].join("\n")
    };
  }

  /**
   * @author alteredq / http://alteredqualia.com/
   */
  Shaders.MaskPass = function ( scene, camera ) {
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;
    this.inverse = false;
  };
  Shaders.MaskPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
      var context = renderer.context;
      // don't update color or depth
      context.colorMask( false, false, false, false );
      context.depthMask( false );
      // set up stencil
      var writeValue, clearValue;
      if ( this.inverse ) {
        writeValue = 0;
        clearValue = 1;
      } else {
        writeValue = 1;
        clearValue = 0;
      }
      context.enable( context.STENCIL_TEST );
      context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
      context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
      context.clearStencil( clearValue );
      // draw into the stencil buffer
      renderer.render( this.scene, this.camera, readBuffer, this.clear );
      renderer.render( this.scene, this.camera, writeBuffer, this.clear );
      // re-enable update of color and depth
      context.colorMask( true, true, true, true );
      context.depthMask( true );
      // only render where stencil is set to 1
      context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
      context.stencilOp( context.KEEP, context.KEEP, context.KEEP );
    }
  };
  
  Shaders.ClearMaskPass = function () {
    this.enabled = true;
  };
  Shaders.ClearMaskPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
      var context = renderer.context;
      context.disable( context.STENCIL_TEST );
    }
  };

  /**
   * @author alteredq / http://alteredqualia.com/
   */
  Shaders.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {
    this.scene = scene;
    this.camera = camera;
    this.overrideMaterial = overrideMaterial;
    this.clearColor = clearColor;
    this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;
    this.oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;
    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;
  };
  Shaders.RenderPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
      this.scene.overrideMaterial = this.overrideMaterial;
      if ( this.clearColor ) {
        this.oldClearColor.copy( renderer.getClearColor() );
        this.oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor( this.clearColor, this.clearAlpha );
      }
      renderer.render( this.scene, this.camera, readBuffer, this.clear );
      if ( this.clearColor ) {
        renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
      }
      this.scene.overrideMaterial = null;
    }
  };

  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Sepia tone shader
   * based on glfx.js sepia shader
   * https://github.com/evanw/glfx.js
   */
    Shaders.SepiaShader = function() {
      return {
        uniforms: {
          "tDiffuse": { type: "t", value: null },
          "amount":   { type: "f", value: 1.0 }
        },
        vertexShader: [
          "varying vec2 vUv;",
          "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform float amount;",
          "uniform sampler2D tDiffuse;",
          "varying vec2 vUv;",
          "void main() {",
            "vec4 color = texture2D( tDiffuse, vUv );",
            "vec3 c = color.rgb;",
            "color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );",
            "color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );",
            "color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );",
            "gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );",
          "}"
        ].join("\n")
      };
    }
  
  /**
   * @author alteredq / http://alteredqualia.com/
   */
  Shaders.ShaderPass = function ( shader, textureID ) {
    this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";
    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });
    this.renderToScreen = false;
    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();
    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );
  };
  Shaders.ShaderPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
      if ( this.uniforms[ this.textureID ] ) {
        this.uniforms[ this.textureID ].value = readBuffer;
      }
      this.quad.material = this.material;
      if ( this.renderToScreen ) {
        renderer.render( this.scene, this.camera );
      } else {
        renderer.render( this.scene, this.camera, writeBuffer, this.clear );
      }
    }
  };

  /**
   * @author alteredq / http://alteredqualia.com/
   */
  Shaders.TexturePass = function ( texture, opacity ) {
    if ( Shaders.CopyShader() === undefined )
      console.error( "Shaders.TexturePass relies on Shaders.CopyShader" );
    var shader = Shaders.CopyShader();
    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    this.uniforms[ "opacity" ].value = ( opacity !== undefined ) ? opacity : 1.0;
    this.uniforms[ "tDiffuse" ].value = texture;
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });
    this.enabled = true;
    this.needsSwap = false;
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();
    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );
  };
  Shaders.TexturePass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
      this.quad.material = this.material;
      renderer.render( this.scene, this.camera, readBuffer );
    }
  };

  /**
   * @author zz85 / http://www.lab4games.net/zz85/blog
   *
   * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
   * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
   *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
   *
   * - 9 samples per pass
   * - standard deviation 2.7
   * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
   */
  Shaders.VerticalBlurShader = function() {
    return {
      uniforms: {
        "tDiffuse": { type: "t", value: null },
        "v":        { type: "f", value: 1.0 / 512.0 }
      },
      vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform float v;",
        "varying vec2 vUv;",
        "void main() {",
          "vec4 sum = vec4( 0.0 );",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",
          "gl_FragColor = sum;",
        "}"
      ].join("\n")
    };
  }

  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Vignette shader
   * based on PaintEffect postprocess from ro.me
   * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
   */
  Shaders.VignetteShader = function() {
    return {
      uniforms: {
        "tDiffuse": { type: "t", value: null },
        "offset":   { type: "f", value: 1.0 },
        "darkness": { type: "f", value: 1.0 }
      },
      vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform float offset;",
        "uniform float darkness;",
        "uniform sampler2D tDiffuse;",
        "varying vec2 vUv;",
        "void main() {",
          // Eskil's vignette
          "vec4 texel = texture2D( tDiffuse, vUv );",
          "vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
          "gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",
          /*
          // alternative version from glfx.js
          // this one makes more "dusty" look (as opposed to "burned")
          "vec4 color = texture2D( tDiffuse, vUv );",
          "float dist = distance( vUv, vec2( 0.5 ) );",
          "color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
          "gl_FragColor = color;",
          */
        "}"
      ].join("\n")
    };
  }

  /**
   * @author alteredq / http://alteredqualia.com/
   */
  Shaders.BloomPass = function ( strength, kernelSize, sigma, resolution ) {
    strength = ( strength !== undefined ) ? strength : 1;
    kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
    sigma = ( sigma !== undefined ) ? sigma : 4.0;
    resolution = ( resolution !== undefined ) ? resolution : 256;
    // render targets
    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
    this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
    this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );
    // copy material
    if ( Shaders.CopyShader() === undefined )
      console.error( "Shaders.BloomPass relies on Shaders.CopyShader" );

    var copyShader = Shaders.CopyShader();
    this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );
    this.copyUniforms[ "opacity" ].value = strength;
    this.materialCopy = new THREE.ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: copyShader.vertexShader,
      fragmentShader: copyShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    // convolution material
    if ( Shaders.ConvolutionShader() === undefined )
      console.error( "Shaders.BloomPass relies on Shaders.ConvolutionShader" );

    var convolutionShader = Shaders.ConvolutionShader();
    this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );
    this.convolutionUniforms[ "uImageIncrement" ].value = Shaders.BloomPass.blurX();
    this.convolutionUniforms[ "cKernel" ].value = Shaders.ConvolutionShader().buildKernel( sigma );
    this.materialConvolution = new THREE.ShaderMaterial({
      uniforms: this.convolutionUniforms,
      vertexShader:  convolutionShader.vertexShader,
      fragmentShader: convolutionShader.fragmentShader,
      defines: {
        "KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
        "KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
      }

    });
    this.enabled = true;
    this.needsSwap = false;
    this.clear = false;
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();
    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );
  };
  Shaders.BloomPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {
      if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

      // Render quad with blured scene into texture (convolution pass 1)

      this.quad.material = this.materialConvolution;

      this.convolutionUniforms[ "tDiffuse" ].value = readBuffer;
      this.convolutionUniforms[ "uImageIncrement" ].value = Shaders.BloomPass.blurX();

      renderer.render( this.scene, this.camera, this.renderTargetX, true );


      // Render quad with blured scene into texture (convolution pass 2)

      this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX;
      this.convolutionUniforms[ "uImageIncrement" ].value = Shaders.BloomPass.blurY();

      renderer.render( this.scene, this.camera, this.renderTargetY, true );

      // Render original scene with superimposed blur to texture

      this.quad.material = this.materialCopy;

      this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY;

      if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

      renderer.render( this.scene, this.camera, readBuffer, this.clear );
    }
  };

  Shaders.BloomPass.blurX = function() {
    return new THREE.Vector2( 0.001953125, 0.0 );
  }
  Shaders.BloomPass.blurY = function() {
    return new THREE.Vector2( 0.0, 0.001953125 );
  }

  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Colorify shader
   */
  Shaders.ColorifyShader = function() {
    return {
      uniforms: {
        "tDiffuse": { type: "t", value: null },
        "color":    { type: "c", value: new THREE.Color( 0xffffff ) }
      },
      vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform vec3 color;",
        "uniform sampler2D tDiffuse;",
        "varying vec2 vUv;",
        "void main() {",
          "vec4 texel = texture2D( tDiffuse, vUv );",
          "vec3 luma = vec3( 0.299, 0.587, 0.114 );",
          "float v = dot( texel.xyz, luma );",
          "gl_FragColor = vec4( v * color, texel.w );",
        "}"
      ].join("\n")
    };
  }

  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Convolution shader
   * ported from o3d sample to WebGL / GLSL
   * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
   */
  Shaders.ConvolutionShader = function() {
    return {

      defines: {

        "KERNEL_SIZE_FLOAT": "25.0",
        "KERNEL_SIZE_INT": "25"
      },

      uniforms: {

        "tDiffuse":        { type: "t", value: null },
        "uImageIncrement": { type: "v2", value: new THREE.Vector2( 0.001953125, 0.0 ) },
        "cKernel":         { type: "fv1", value: [] }

      },

      vertexShader: [

        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

          "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

      ].join("\n"),

      fragmentShader: [

        "uniform float cKernel[ KERNEL_SIZE_INT ];",

        "uniform sampler2D tDiffuse;",
        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

          "vec2 imageCoord = vUv;",
          "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

          "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

            "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
            "imageCoord += uImageIncrement;",

          "}",

          "gl_FragColor = sum;",

        "}"


      ].join("\n"),

      buildKernel: function ( sigma ) {

        // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

        function gauss( x, sigma ) {

          return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

        }

        var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

        if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
        halfWidth = ( kernelSize - 1 ) * 0.5;

        values = new Array( kernelSize );
        sum = 0.0;
        for ( i = 0; i < kernelSize; ++i ) {

          values[ i ] = gauss( i - halfWidth, sigma );
          sum += values[ i ];

        }

        // normalize the kernel

        for ( i = 0; i < kernelSize; ++i ) values[ i ] /= sum;

        return values;

      }

    };
  }

  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Full-screen textured quad shader
   */
  Shaders.CopyShader = function() {
    return {
      uniforms: {

        "tDiffuse": { type: "t", value: null },
        "opacity":  { type: "f", value: 1.0 }

      },

      vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

      ].join("\n"),

      fragmentShader: [

        "uniform float opacity;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

          "vec4 texel = texture2D( tDiffuse, vUv );",
          "gl_FragColor = opacity * texel;",

        "}"

      ].join("\n")

    };
  }

  /**
   * @author alteredq / http://alteredqualia.com/
   */
  Shaders.DotScreenPass = function ( center, angle, scale ) {
    if ( Shaders.DotScreenShader() === undefined )
      console.error( "Shaders.DotScreenPass relies on Shaders.DotScreenShader" );

    var shader = Shaders.DotScreenShader();

    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    if ( center !== undefined ) this.uniforms[ "center" ].value.copy( center );
    if ( angle !== undefined ) this.uniforms[ "angle"].value = angle;
    if ( scale !== undefined ) this.uniforms[ "scale"].value = scale;

    this.material = new THREE.ShaderMaterial( {

      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader

    } );

    this.enabled = true;
    this.renderToScreen = false;
    this.needsSwap = true;


    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

  };
  Shaders.DotScreenPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

      this.uniforms[ "tDiffuse" ].value = readBuffer;
      this.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );

      this.quad.material = this.material;

      if ( this.renderToScreen ) {

        renderer.render( this.scene, this.camera );

      } else {

        renderer.render( this.scene, this.camera, writeBuffer, false );

      }

    }

  };

  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Dot screen shader
   * based on glfx.js sepia shader
   * https://github.com/evanw/glfx.js
   */
  Shaders.DotScreenShader = function() {
    return {
      uniforms: {

        "tDiffuse": { type: "t", value: null },
        "tSize":    { type: "v2", value: new THREE.Vector2( 256, 256 ) },
        "center":   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
        "angle":    { type: "f", value: 1.57 },
        "scale":    { type: "f", value: 1.0 }

      },

      vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

      ].join("\n"),

      fragmentShader: [

        "uniform vec2 center;",
        "uniform float angle;",
        "uniform float scale;",
        "uniform vec2 tSize;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "float pattern() {",

          "float s = sin( angle ), c = cos( angle );",

          "vec2 tex = vUv * tSize - center;",
          "vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

          "return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

        "}",

        "void main() {",

          "vec4 color = texture2D( tDiffuse, vUv );",

          "float average = ( color.r + color.g + color.b ) / 3.0;",

          "gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

        "}"

      ].join("\n")
    };
  }

  /**
   * @author alteredq / http://alteredqualia.com/
   */
  Shaders.EffectComposer = function ( renderer, renderTarget ) {
    this.renderer = renderer;

    if ( renderTarget === undefined ) {

      var width = window.innerWidth || 1;
      var height = window.innerHeight || 1;
      var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

      renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.passes = [];

    if ( Shaders.CopyShader() === undefined )
      console.error( "Shaders.EffectComposer relies on Shaders.CopyShader" );

    this.copyPass = new Shaders.ShaderPass( Shaders.CopyShader() );

  };
  Shaders.EffectComposer.prototype = {
    swapBuffers: function() {
      var tmp = this.readBuffer;
      this.readBuffer = this.writeBuffer;
      this.writeBuffer = tmp;
    },
    addPass: function ( pass ) {
      this.passes.push( pass );
    },
    insertPass: function ( pass, index ) {
      this.passes.splice( index, 0, pass );
    },
    render: function ( delta ) {
      this.writeBuffer = this.renderTarget1;
      this.readBuffer = this.renderTarget2;

      var maskActive = false;

      var pass, i, il = this.passes.length;

      for ( i = 0; i < il; i ++ ) {

        pass = this.passes[ i ];

        if ( !pass.enabled ) continue;

        pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

        if ( pass.needsSwap ) {

          if ( maskActive ) {

            var context = this.renderer.context;

            context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

            this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

            context.stencilFunc( context.EQUAL, 1, 0xffffffff );

          }

          this.swapBuffers();

        }

        if ( pass instanceof Shaders.MaskPass ) {

          maskActive = true;

        } else if ( pass instanceof Shaders.ClearMaskPass ) {

          maskActive = false;

        }

      }

    },

    reset: function ( renderTarget ) {

      if ( renderTarget === undefined ) {

        renderTarget = this.renderTarget1.clone();

        renderTarget.width = window.innerWidth;
        renderTarget.height = window.innerHeight;

      }

      this.renderTarget1 = renderTarget;
      this.renderTarget2 = renderTarget.clone();

      this.writeBuffer = this.renderTarget1;
      this.readBuffer = this.renderTarget2;

    },

    setSize: function ( width, height ) {

      var renderTarget = this.renderTarget1.clone();

      renderTarget.width = width;
      renderTarget.height = height;

      this.reset( renderTarget );

    }

  };

  /**
   * @author alteredq / http://alteredqualia.com/
   */
  Shaders.FilmPass = function ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

    if ( Shaders.FilmShader() === undefined )
      console.error( "Shaders.FilmPass relies on Shaders.FilmShader" );

    var shader = Shaders.FilmShader();

    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    this.material = new THREE.ShaderMaterial( {

      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader

    } );

    if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
    if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
    if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
    if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

    this.enabled = true;
    this.renderToScreen = false;
    this.needsSwap = true;


    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

  };
  Shaders.FilmPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

      this.uniforms[ "tDiffuse" ].value = readBuffer;
      this.uniforms[ "time" ].value += delta;

      this.quad.material = this.material;

      if ( this.renderToScreen ) {

        renderer.render( this.scene, this.camera );

      } else {

        renderer.render( this.scene, this.camera, writeBuffer, false );

      }

    }

  };


//-- TWEEN
function Tween(timeArray, valueArray) {
	this.times  = timeArray || [];
	this.values = valueArray || [];
}
Tween.prototype.lerp = function(t) {
	var i = 0;
	var n = this.times.length;
	while (i < n && t > this.times[i])  
		i++;
	if (i == 0) return this.values[0];
	if (i == n)	return this.values[n-1];
	var p = (t - this.times[i-1]) / (this.times[i] - this.times[i-1]);
	if (this.values[0] instanceof THREE.Vector3)
		return this.values[i-1].clone().lerp( this.values[i], p );
	else // its a float
		return this.values[i-1] + p * (this.values[i] - this.values[i-1]);
}

//-- PARTICLE
function Particle() {
	this.position = new THREE.Vector3();
	this.velocity = new THREE.Vector3(); // units per second
	this.acceleration = new THREE.Vector3();
	this.angle = 0;
	this.angleVelocity = 0; // degrees per second
	this.angleAcceleration = 0; // degrees per second, per second
	this.size = 16.0;
	this.color = new THREE.Color();
	this.opacity = 1.0;
	this.age = 0;
	this.alive = 0; // use float instead of boolean for shader purposes	
}
Particle.prototype.update = function(dt) {
	this.position.add( this.velocity.clone().multiplyScalar(dt) );
	this.velocity.add( this.acceleration.clone().multiplyScalar(dt) );
	
	// convert from degrees to radians: 0.01745329251 = Math.PI/180
	this.angle += this.angleVelocity     * 0.01745329251 * dt;
	this.angleVelocity += this.angleAcceleration * 0.01745329251 * dt;
	this.age += dt;
	//if the tween for a given attribute is nonempty,
	//then use it to update the attribute's value
	if( this.sizeTween.times.length > 0 ) {
		this.size = this.sizeTween.lerp( this.age );
  }
	if( this.colorTween.times.length > 0 ) {
		var colorHSL = this.colorTween.lerp( this.age );
		this.color = new THREE.Color().setHSL( colorHSL.x, colorHSL.y, colorHSL.z );
	}
	if( this.opacityTween.times.length > 0 ) {
		this.opacity = this.opacityTween.lerp( this.age );
  }
}

//-- ParticleEngine
function ParticleEngine( options ) {
  options = options || {};
	//PARTICLE PROPERTIES
	this.positionStyle = Type.CUBE;
	
	// sphere shape data
	this.positionRadius = 0; // distance from base at which particles start
	this.velocityStyle = Type.CUBE;
	// sphere movement data
	// direction vector calculated using initial position
	this.speedBase = 0;
	this.speedSpread = 0;
	this.angleBase = 0;
	this.angleSpread = 0;
	this.angleVelocityBase = 0;
	this.angleVelocitySpread = 0;
	this.angleAccelerationBase = 0;
	this.angleAccelerationSpread = 0;
	this.sizeBase = 0.0;
	this.sizeSpread = 0.0;
	// store colors in HSL format in a THREE.Vector3 object
	// http://en.wikipedia.org/wiki/HSL_and_HSV
	this.opacityBase = 1.0;
	this.opacitySpread = 0.0;
	this.particleArray = [];
	this.particlesPerSecond = 100;
	this.particleDeathAge = 1.0;
	//EMITTER PROPERTIES
	this.emitterAge = 0.0;
	this.emitterAlive = true;
	this.emitterDeathAge = 60; // time (seconds) at which to stop creating particles.
	// How many particles could be active at any time?
	this.particleCount = this.particlesPerSecond * Math.min( this.particleDeathAge, this.emitterDeathAge );
  this.positionBase   = new THREE.Vector3();
	// cube shape data
	this.positionSpread = new THREE.Vector3();
  
  // cube movement data
	this.velocityBase = new THREE.Vector3();
	this.velocitySpread = new THREE.Vector3();
  
	this.accelerationBase = new THREE.Vector3();
	this.accelerationSpread = new THREE.Vector3();
  this.sizeTween = new root.ThreeDWgt.Tween();
	this.colorTween = new root.ThreeDWgt.Tween();
	this.opacityTween = new root.ThreeDWgt.Tween();
	this.colorBase = new THREE.Vector3(0.0, 1.0, 0.5); 
	this.colorSpread = new THREE.Vector3(0.0, 0.0, 0.0);
	this.blendStyle = THREE.NormalBlending; // false;
	this.particleGeometry = new THREE.Geometry();
	this.particleTexture  = null;
  var shaders = root.ThreeDWgt.Shaders;
    
  var particleVertexShader = this.particleVertexShader = shaders.ParticleShader().vertexShader;
  var particleFragmentShader = this.particleFragmentShader = shaders.ParticleShader().fragmentShader;
	this.particleMaterial = new THREE.ShaderMaterial({
		uniforms:{
			texture:{ type:"t", value:this.particleTexture }
		}
		,attributes:{
			customVisible:	{ type: 'f',  value: [] },
			customAngle:	{ type: 'f',  value: [] },
			customSize:		{ type: 'f',  value: [] },
			customColor:	{ type: 'c',  value: [] },
			customOpacity:	{ type: 'f',  value: [] }
		}
		,vertexShader:particleVertexShader
		,fragmentShader:particleFragmentShader
		,transparent:true// alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5, 
		,blending:THREE.NormalBlending
    ,depthTest:true
	});
	this.particleMesh = new THREE.Mesh();
}
ParticleEngine.prototype.setValues = function( parameters ) {
	if ( parameters === undefined ) return;
	// clear any previous tweens that might exist
	this.sizeTween    = new root.ThreeDWgt.Tween();
	this.colorTween   = new root.ThreeDWgt.Tween();
	this.opacityTween = new root.ThreeDWgt.Tween();
	for( var key in parameters ) {
		this[ key ] = parameters[ key ];
  }
	// attach tweens to particles
	Particle.prototype.sizeTween = this.sizeTween;
	Particle.prototype.colorTween = this.colorTween;
	Particle.prototype.opacityTween = this.opacityTween;
	// calculate/set derived particle engine values
	this.particleArray = [];
	this.emitterAge = 0.0;
	this.emitterAlive = true;
	this.particleCount = this.particlesPerSecond * Math.min( this.particleDeathAge, this.emitterDeathAge );
	this.particleGeometry = new THREE.Geometry();
	this.particleMaterial = new THREE.ShaderMaterial({
		uniforms: 
		{
			texture:   { type: "t", value: this.particleTexture }
		},
		attributes:     
		{
			customVisible:	{ type: 'f',  value: [] },
			customAngle:	{ type: 'f',  value: [] },
			customSize:		{ type: 'f',  value: [] },
			customColor:	{ type: 'c',  value: [] },
			customOpacity:	{ type: 'f',  value: [] }
		},
		vertexShader:   this.particleVertexShader,
		fragmentShader: this.particleFragmentShader,
		transparent: true,  alphaTest: 0.5, // if having transparency issues, try including: alphaTest: 0.5, 
		blending: THREE.NormalBlending
    ,depthTest: true
	});
	this.particleMesh = new THREE.ParticleSystem();
}
// helper functions for randomization
ParticleEngine.prototype.randomValue = function(base, spread) {
	return base + spread * (Math.random() - 0.5);
}
ParticleEngine.prototype.randomVector3 = function(base, spread) {
	var rand3 = new THREE.Vector3( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
	return new THREE.Vector3().addVectors( base, new THREE.Vector3().multiplyVectors( spread, rand3 ) );
}
ParticleEngine.prototype.createParticle = function() {
	var particle = new Particle();
	if (this.positionStyle == Type.CUBE) {
		particle.position = this.randomVector3( this.positionBase, this.positionSpread ); 
  }
	if(this.positionStyle == Type.SPHERE) {
		var z = 2 * Math.random() - 1;
		var t = 6.2832 * Math.random();
		var r = Math.sqrt( 1 - z*z );
		var vec3 = new THREE.Vector3( r * Math.cos(t), r * Math.sin(t), z );
		particle.position = new THREE.Vector3().addVectors( this.positionBase, vec3.multiplyScalar( this.positionRadius ) );
	}
	if( this.velocityStyle == Type.CUBE ) {
		particle.velocity     = this.randomVector3( this.velocityBase,     this.velocitySpread ); 
	}
	if( this.velocityStyle == Type.SPHERE ) {
		var direction = new THREE.Vector3().subVectors( particle.position, this.positionBase );
		var speed     = this.randomValue( this.speedBase, this.speedSpread );
		particle.velocity  = direction.normalize().multiplyScalar( speed );
	}
	particle.acceleration = this.randomVector3( this.accelerationBase, this.accelerationSpread );
	particle.angle = this.randomValue( this.angleBase, this.angleSpread );
	particle.angleVelocity = this.randomValue( this.angleVelocityBase, this.angleVelocitySpread );
	particle.angleAcceleration = this.randomValue( this.angleAccelerationBase, this.angleAccelerationSpread );

	particle.size = this.randomValue( this.sizeBase, this.sizeSpread );
	var color = this.randomVector3( this.colorBase, this.colorSpread );
	particle.color = new THREE.Color().setHSL( color.x, color.y, color.z );
	particle.opacity = this.randomValue( this.opacityBase, this.opacitySpread );
	particle.age = 0;
	particle.alive = 0; // particles initialize as inactive
	//particle.__dirtyVertices = true; // particles initialize as inactive
	return particle;
}
ParticleEngine.prototype.initialize = function( options ) {
  options = options || {};
  var scene = this.scene = options.scene;
	// link particle data with geometry/material data
	for(var i = 0; i < this.particleCount; i++) {
		// remove duplicate code somehow, here and in update function below.
		this.particleArray[i] = this.createParticle();
		this.particleGeometry.vertices[i] = this.particleArray[i].position;
		this.particleMaterial.attributes.customVisible.value[i] = this.particleArray[i].alive;
		this.particleMaterial.attributes.customColor.value[i] = this.particleArray[i].color;
		this.particleMaterial.attributes.customOpacity.value[i] = this.particleArray[i].opacity;
		this.particleMaterial.attributes.customSize.value[i] = this.particleArray[i].size;
		this.particleMaterial.attributes.customAngle.value[i] = this.particleArray[i].angle;
	}
	this.particleMaterial.blending = this.blendStyle;
	if( this.blendStyle != THREE.NormalBlending) {
		this.particleMaterial.depthTest = false;
	}
	this.particleMesh = new THREE.ParticleSystem( this.particleGeometry, this.particleMaterial );
	this.particleMesh.dynamic = true;
	this.particleMesh.sortParticles = true;
	scene.add( this.particleMesh );
}
ParticleEngine.prototype.update = function(dt) {
	var recycleIndices = [];
	// update particle data
	for(var i = 0; i < this.particleCount; i++) {
		if( this.particleArray[i].alive ) {
			this.particleArray[i].update(dt);
			// check if particle should expire
			// could also use: death by size<0 or alpha<0.
			if( this.particleArray[i].age > this.particleDeathAge ) {
				this.particleArray[i].alive = 0.0;
				recycleIndices.push(i);
			}
			// update particle properties in shader
			this.particleMaterial.attributes.customVisible.value[i] = this.particleArray[i].alive;
			this.particleMaterial.attributes.customColor.value[i]   = this.particleArray[i].color;
			this.particleMaterial.attributes.customOpacity.value[i] = this.particleArray[i].opacity;
			this.particleMaterial.attributes.customSize.value[i]    = this.particleArray[i].size;
			this.particleMaterial.attributes.customAngle.value[i]   = this.particleArray[i].angle;
		}
	}
	// check if particle emitter is still running
	if( !this.emitterAlive ) return;

	// if no particles have died yet, then there are still particles to activate
	if( this.emitterAge < this.particleDeathAge ) {
		// determine indices of particles to activate
		var startIndex = Math.round( this.particlesPerSecond * (this.emitterAge +  0) );
		var   endIndex = Math.round( this.particlesPerSecond * (this.emitterAge + dt) );
		if( endIndex > this.particleCount ) {
      endIndex = this.particleCount;
		}	  
		for(var i = startIndex; i < endIndex; i++) {
			this.particleArray[i].alive = 1.0;
    }
	}
	// if any particles have died while the emitter is still running, we imediately recycle them
	for(var j = 0; j < recycleIndices.length; j++) {
		var i = recycleIndices[j];
		this.particleArray[i] = this.createParticle();
		this.particleArray[i].alive = 1.0; // activate right away
		this.particleGeometry.vertices[i] = this.particleArray[i].position;
	}
	// stop emitter?
	this.emitterAge += dt;
	if( this.emitterAge > this.emitterDeathAge ) { this.emitterAlive = false; }
}
ParticleEngine.prototype.destroy = function() {
    this.scene.remove( this.particleMesh );
}
//author Lee Stemkoski   http://www.adelphi.edu/~stemkoski/
/* 
	Particle Engine options:
	positionBase   : new THREE.Vector3(),
	positionStyle : Type.CUBE or Type.SPHERE,
	// for Type.CUBE
	positionSpread  : new THREE.Vector3(),

	// for Type.SPHERE
	positionRadius  : 10,
	
	velocityStyle : Type.CUBE or Type.SPHERE,

	// for Type.CUBE
	velocityBase       : new THREE.Vector3(),
	velocitySpread     : new THREE.Vector3(), 

	// for Type.SPHERE
	speedBase   : 20,
	speedSpread : 10,
		
	accelerationBase   : new THREE.Vector3(),
	accelerationSpread : new THREE.Vector3(),
		
	particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/star.png' ),
		
	// rotation of image used for particles
	angleBase               : 0,
	angleSpread             : 0,
	angleVelocityBase       : 0,
	angleVelocitySpread     : 0,
	angleAccelerationBase   : 0,
	angleAccelerationSpread : 0,
		
	// size, color, opacity 
	//   for static  values, use base/spread
	//   for dynamic values, use Tween
	//   (non-empty Tween takes precedence)
	sizeBase   : 20.0,
	sizeSpread : 5.0,
	sizeTween  : new root.ThreeDWgt.Tween( [0, 1], [1, 20] ),
			
	// colors stored in Vector3 in H,S,L format
	colorBase   : new THREE.Vector3(0.0, 1.0, 0.5),
	colorSpread : new THREE.Vector3(0,0,0),
	colorTween  : new root.ThreeDWgt.Tween( [0.5, 2], [ new THREE.Vector3(0, 1, 0.5), new THREE.Vector3(1, 1, 0.5) ] ),

	opacityBase   : 1,
	opacitySpread : 0,
	opacityTween  : new root.ThreeDWgt.Tween( [2, 3], [1, 0] ),
	
	blendStyle    : THREE.NormalBlending (default), THREE.AdditiveBlending

	particlesPerSecond : 200,
	particleDeathAge   : 2.0,		
	emitterDeathAge    : 60	
*/
function ParticleEffects( options ) {
  options = options || {};
	// (1) build GUI for easy effects access.
	// (2) write ParticleEngineExamples.js
	// Not just any fountain -- a RAINBOW STAR FOUNTAIN of AWESOMENESS
	var effects = {
    fountain:{
      positionStyle : Type.CUBE,
      positionBase : new THREE.Vector3( 0,  5, 0 ),
      positionSpread : new THREE.Vector3( 10, 0, 10 ),
      velocityStyle : Type.CUBE,
      velocityBase : new THREE.Vector3( 0,  160, 0 ),
      velocitySpread : new THREE.Vector3( 100, 20, 100 ),
      accelerationBase : new THREE.Vector3( 0, -100, 0 ),
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/star.png' ),
      angleBase               : 0,
      angleSpread             : 180,
      angleVelocityBase       : 0,
      angleVelocitySpread     : 360 * 4,
      sizeTween    : new root.ThreeDWgt.Tween( [0, 1], [1, 20] ),
      opacityTween : new root.ThreeDWgt.Tween( [2, 3], [1, 0] ),
      colorTween   : new root.ThreeDWgt.Tween( [0.5, 2], [ new THREE.Vector3(0,1,0.5), new THREE.Vector3(0.8, 1, 0.5) ] ),
      particlesPerSecond : 200,
      particleDeathAge   : 3.0,		
      emitterDeathAge    : 60
    }
    ,fireball:{
      positionStyle:Type.SPHERE,
      positionBase:new THREE.Vector3( 0, 50, 0 ),
      positionRadius:2,
      velocityStyle : Type.SPHERE,
      speedBase     : 40,
      speedSpread   : 8,
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/smokeparticle.png' ),
      sizeTween    : new root.ThreeDWgt.Tween( [0, 0.1], [1, 150] ),
      opacityTween : new root.ThreeDWgt.Tween( [0.7, 1], [1, 0] ),
      colorBase    : new THREE.Vector3(0.02, 1, 0.4),
      blendStyle   : THREE.AdditiveBlending,
      particlesPerSecond:60,
      particleDeathAge:1.5,
      emitterDeathAge:60
    }
    ,smoke: {
      positionStyle:Type.CUBE,
      positionBase     : new THREE.Vector3( 0, 0, 0 ),
      positionSpread   : new THREE.Vector3( 10, 0, 10 ),
      velocityStyle    : Type.CUBE,
      velocityBase     : new THREE.Vector3( 0, 150, 0 ),
      velocitySpread   : new THREE.Vector3( 80, 50, 80 ), 
      accelerationBase : new THREE.Vector3( 0,-10,0 ),
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/smokeparticle.png'),
      angleBase               : 0,
      angleSpread             : 720,
      angleVelocityBase       : 0,
      angleVelocitySpread     : 720,
      sizeTween    : new root.ThreeDWgt.Tween( [0, 1], [32, 128] ),
      opacityTween : new root.ThreeDWgt.Tween( [0.8, 2], [0.5, 0] ),
      colorTween   : new root.ThreeDWgt.Tween( [0.4, 1], [ new THREE.Vector3(0,0,0.2), new THREE.Vector3(0, 0, 0.5) ] ),
      particlesPerSecond : 200,
      particleDeathAge   : 2.0,		
      emitterDeathAge    : 60
    }
    ,clouds:{
      positionStyle  : Type.CUBE,
      positionBase   : new THREE.Vector3( -100, 100,  0 ),
      //positionSpread : new THREE.Vector3(    0,  50, 60 ),
      positionSpread : new THREE.Vector3( 400, 200, 400 ),
      velocityStyle  : Type.CUBE,
      velocityBase   : new THREE.Vector3( 40, 0, 0 ),
      velocitySpread : new THREE.Vector3( 20, 0, 0 ),
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/smokeparticle.png'),
      sizeBase    : 80.0,
      sizeSpread   : 200.0,
      colorBase    : new THREE.Vector3(0.0, 0.0, 1.0), // H,S,L
      opacityTween : new root.ThreeDWgt.Tween([0,1,4,5],[0,1,1,0]),
      particlesPerSecond : 50,
      particleDeathAge   : 10.0,		
      emitterDeathAge    : 60
    }
    ,snow:{
      positionStyle    : Type.CUBE,
      positionBase     : new THREE.Vector3( 0, 200, 0 ),
      positionSpread   : new THREE.Vector3( 500, 0, 500 ),
      velocityStyle    : Type.CUBE,
      velocityBase     : new THREE.Vector3( 0, -60, 0 ),
      velocitySpread   : new THREE.Vector3( 50, 20, 50 ), 
      accelerationBase : new THREE.Vector3( 0, -10,0 ),
      angleBase               : 0,
      angleSpread             : 720,
      angleVelocityBase       :  0,
      angleVelocitySpread     : 60,
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/snowflake.png' ),
      sizeTween    : new root.ThreeDWgt.Tween( [0, 0.25], [1, 10] ),
      colorBase   : new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
      opacityTween : new root.ThreeDWgt.Tween( [2, 3], [0.8, 0] ),
      particlesPerSecond : 200,
      particleDeathAge   : 4.0,		
      emitterDeathAge    : 60
    }
    ,rain:{
      positionStyle    : Type.CUBE,
      positionBase     : new THREE.Vector3( 0, 200, 0 ),
      positionSpread   : new THREE.Vector3( 600, 0, 600 ),
      velocityStyle    : Type.CUBE,
      velocityBase     : new THREE.Vector3( 0, -400, 0 ),
      velocitySpread   : new THREE.Vector3( 10, 50, 10 ), 
      accelerationBase : new THREE.Vector3( 0, -10,0 ),
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/raindrop2flip.png' ),
      sizeBase    : 8.0,
      sizeSpread  : 4.0,
      colorBase   : new THREE.Vector3(0.66, 1.0, 0.7), // H,S,L
      colorSpread : new THREE.Vector3(0.00, 0.0, 0.2),
      opacityBase : 0.6,
      particlesPerSecond : 1000,
      particleDeathAge   : 1.0,		
      emitterDeathAge    : 60
    }
    ,starfield:{
      positionStyle    : Type.CUBE,
      positionBase     : new THREE.Vector3( 50, 100, 50 ), //new THREE.Vector3( 0, 200, 0 ),
      positionSpread   : new THREE.Vector3( 2560, 100, 2560 ), //new THREE.Vector3( 600, 400, 600 ),
      velocityStyle    : Type.CUBE,
      velocityBase     : new THREE.Vector3( 0, 0, 0 ),
      velocitySpread   : new THREE.Vector3( 0.5, 0.5, 0.5 ), 
      angleBase               : 0,
      angleSpread             : 720,
      angleVelocityBase       : 0,
      angleVelocitySpread     : 4,
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/spikey.png' ),
      sizeBase    : 10.0,
      sizeSpread  : 5.0,
      colorBase   : new THREE.Vector3(0.15, 1.0, 0.9), // H,S,L
      colorSpread : new THREE.Vector3(0.00, 0.0, 0.2),
      opacityBase : 1,
      particlesPerSecond : 40000,
      particleDeathAge   : 600,//60.0,
      emitterDeathAge    : 0.1
    }
    ,fireflies:{
      positionStyle  : Type.CUBE,
      positionBase   : new THREE.Vector3( 0, 100, 0 ),
      positionSpread : new THREE.Vector3( 400, 200, 400 ),
      velocityStyle  : Type.CUBE,
      velocityBase   : new THREE.Vector3( 0, 0, 0 ),
      velocitySpread : new THREE.Vector3( 60, 20, 60 ),
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/spark.png' ),
      sizeBase   : 30.0,
      sizeSpread : 2.0,
      opacityTween : new root.ThreeDWgt.Tween([0.0, 1.0, 1.1, 2.0, 2.1, 3.0, 3.1, 4.0, 4.1, 5.0, 5.1, 6.0, 6.1],
                               [0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2] ),				
      colorBase   : new THREE.Vector3(0.30, 1.0, 0.6), // H,S,L
      colorSpread : new THREE.Vector3(0.3, 0.0, 0.0),
      particlesPerSecond : 20,
      particleDeathAge   : 6.1,		
      emitterDeathAge    : 600
    }
    ,startunnel:{
      positionStyle  : Type.CUBE,
      positionBase   : new THREE.Vector3( 0, 0, 0 ),
      positionSpread : new THREE.Vector3( 10, 10, 10 ),
      velocityStyle  : Type.CUBE,
      velocityBase   : new THREE.Vector3( 0, 100, 200 ),
      velocitySpread : new THREE.Vector3( 40, 40, 80 ),
      angleBase               : 0,
      angleSpread             : 720,
      angleVelocityBase       : 10,
      angleVelocitySpread     : 0,
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/spikey.png' ),
      sizeBase    : 4.0,
      sizeSpread  : 2.0,				
      colorBase   : new THREE.Vector3(0.15, 1.0, 0.8), // H,S,L
      opacityBase : 1,
      blendStyle  : THREE.AdditiveBlending,
      particlesPerSecond : 500,
      particleDeathAge   : 4.0,		
      emitterDeathAge    : 60
    }
    ,firework:{
      positionStyle  : Type.SPHERE,
      positionBase   : new THREE.Vector3( 0, 100, 0 ),
      positionRadius : 10,
      velocityStyle  : Type.SPHERE,
      speedBase      : 90,
      speedSpread    : 10,
      accelerationBase : new THREE.Vector3( 0, -80, 0 ),
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/spark.png' ),
      sizeTween    : new root.ThreeDWgt.Tween( [0.5, 0.7, 1.3], [5, 40, 1] ),
      opacityTween : new root.ThreeDWgt.Tween( [0.2, 0.7, 2.5], [0.75, 1, 0] ),
      colorTween   : new root.ThreeDWgt.Tween( [0.4, 0.8, 1.0], [ new THREE.Vector3(0,1,1), new THREE.Vector3(0,1,0.6), new THREE.Vector3(0.8, 1, 0.6) ] ),
      blendStyle   : THREE.AdditiveBlending,
      particlesPerSecond : 3000,
      particleDeathAge   : 2.5,		
      emitterDeathAge    : 0.2
    }
    ,candle:{
      positionStyle  : Type.SPHERE,
      positionBase   : new THREE.Vector3( 0, 50, 0 ),
      positionRadius : 2,
      velocityStyle  : Type.CUBE,
      velocityBase   : new THREE.Vector3(0,100,0),
      velocitySpread : new THREE.Vector3(20,0,20),
      particleTexture : THREE.ImageUtils.loadTexture( 'images/nemo/threeD/smokeparticle.png' ),
      sizeTween    : new root.ThreeDWgt.Tween( [0, 0.3, 1.2], [20, 150, 1] ),
      opacityTween : new root.ThreeDWgt.Tween( [0.9, 1.5], [1, 0] ),
      colorTween   : new root.ThreeDWgt.Tween( [0.5, 1.0], [ new THREE.Vector3(0.02, 1, 0.5), new THREE.Vector3(0.05, 1, 0) ] ),
      blendStyle : THREE.AdditiveBlending,
      particlesPerSecond : 60,
      particleDeathAge   : 1.5,		
      emitterDeathAge    : 60
    }
  };
  return effects;
}

function Skybox( options ) {
  options = options || {};
  var imgPath = options.imgPath
  ,config = this.config = options.config || {}
  ,skytheme = config.skytheme || 'evening'
  ,imagePrefix = imgPath+"/nemo/threeD/textures/cube/skybox/"+skytheme+"/"
  ,imageType = config.imageType || ".jpg"
  ,directions = config.directions || ["px", "nx", "py", "ny", "pz", "nz"]
  ;
  /*if( !THREE.CubeTexture ) {
    THREE.CubeTexture = function ( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {
      THREE.Texture.call( this, images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );
      this.images = images;
    };
    THREE.CubeTexture.prototype = Object.create( THREE.Texture.prototype );
    THREE.CubeTexture.clone = function ( texture ) {
      if ( texture === undefined ) texture = new THREE.CubeTexture();
      THREE.Texture.prototype.clone.call( this, texture );
      texture.images = this.images;
      return texture;
    };
  }*/
  var skyboxtiles = this.skyboxtiles = {
    length:0
    ,loaded:0
    ,skytheme: skytheme
    ,imageType: imageType
    ,imgPath: imgPath
    ,imagePrefix: imagePrefix
    ,texture:(function() {
      //var images = []; var mapping;
      //var texture = new THREE.CubeTexture( images, mapping );
      var texture = new THREE.Texture();
      //texture.images = [];
      texture.flipY = false;
      return texture;
    })()
    ,imageURL:[]
    ,materialArray:[]
    ,tiles:{}
    ,directions: directions //naming for skybox images: n:negative, p:positive in x,y,z directions
    ,loadTextureCube:function( i, img, callback ) {
      if( !this.texture.image ) this.texture.image = [];
      var texture = this.texture.image[ i ] = img;
      this.loaded += 1;
      this.length += 1;
      if( this.loaded === this.directions.length ) {
        //this.texture.needsUpdate = true;
        this.texture.onUpdate = function() {
          texture.needsUpdate = true;
        };
        //console.log("loadTextureCube: this.texture: ");console.log( this.texture );
        callback( this.texture );
      }
      //return this.texture;
    }
  };
  
  for (var i = 0; i < directions.length; i++) {
    var id = skyboxtiles.directions[i];
    var url = skyboxtiles.imagePrefix + id + skyboxtiles.imageType;
    if( !this.skyboxtiles.tiles[ id ] ) {
      this.skyboxtiles.tiles[ id ] = {};
    }
    //this.skyboxtiles.texture.images[i] = new Image();
    this.skyboxtiles.tiles[ id ].id = id;
    this.skyboxtiles.tiles[ id ].index = i;
    this.skyboxtiles.tiles[ id ].url = url;
    this.skyboxtiles.imageURL.push( url );
  }
};
Skybox.prototype.create = function( options ) {
  options = options || {};
  var scene = options.scene;
  
  var config = this.config
  ,skyboxtiles = this.skyboxtiles
  ,imageURL = this.skyboxtiles.imageURL
  ,x = options.xyz || config.xyz || config.x || 10240
  ,y = options.xyz || config.xyz || config.y || 10240
  ,z = options.xyz || config.xyz || config.z || 10240
  ,skyGeometry = new THREE.CubeGeometry( x, y, z, 1, 1, 1 )
  //,skyGeometry = new THREE.CubeGeometry( x, y, z )
  //,skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000, 1, 1, 1)
  ,directions = this.skyboxtiles.directions
  ;
  
  var materialArray = [];
  for( var i=0; i<directions.length; i++ ) {
    var mat = new THREE.MeshBasicMaterial({
      blending:THREE.AdditiveBlending //TBD:remove if error
      ,map: THREE.ImageUtils.loadTexture(imageURL[i]) //texture //imagePrefix + directions[i] + imageSuffix
      ,side:THREE.BackSide
    })
    materialArray.push( mat );
  }
  var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
  var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
  scene.add( skyBox );
    

  //this.drawSkyboxTiles( options );
  /*var that = this;
  var directions = this.skyboxtiles.directions;
  var runTime = 100;
  //re-initialize
  this.skyboxtiles.length = 0;
  this.skyboxtiles.loaded = [];
  for (var i = 0; i < directions.length; i++) {
    (function(j,runTime) {
      var imageObj = that.skyboxtiles.tiles[ directions[j] ];
      vidteq.ImageUtils.loadImage({
        file: imageObj.url
        ,responseType:'blob'
        ,callback: function(img, data, callbackData ) {
          var texture = new THREE.Texture();
          texture.image = img;
          texture.flipY = false;
          texture.needsUpdate = true;
          var material = new THREE.MeshBasicMaterial({
            blending:THREE.AdditiveBlending
            ,map:texture
            ,side:THREE.BackSide
          });
          material.map,needsUpdate = true;
          material.name = callbackData.imageObj.id;
          callbackData.imageObj.material = material;
          that.skyboxtiles.loaded.push(callbackData.imageObj.index);
          console.log("callbackData:");console.log(callbackData);
          if( that.skyboxtiles.loaded.length > 5 ) {
            that.drawSkyboxTiles( options );
          }
          //that.skyboxtiles.loadTextureCube( j, img, function( texture ) {
          //  console.log("texture: loadTextureCube: callback: ");console.log(texture);
          //  that.drawSkyboxTiles( options, texture );
          //});
          //runTime += 100;
          
        }
        ,callbackData: {imageObj:imageObj}
      });
    })(i,runTime);
  }
  */
};
Skybox.prototype.drawSkyboxTiles = function( options, texture, image, data, callbackData ) {
  options = options || {};
  var scene = options.scene;
  
  var config = this.config
  ,skyboxtiles = this.skyboxtiles
  ,imageURL = this.skyboxtiles.imageURL
  ,x = options.xyz || config.xyz || config.x || 10240
  ,y = options.xyz || config.xyz || config.y || 10240
  ,z = options.xyz || config.xyz || config.z || 10240
  ,skyGeometry = new THREE.CubeGeometry( x, y, z )
  //,skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000, 1, 1, 1)
  ,directions = this.skyboxtiles.directions
  ;
  //var texture = texture || THREE.ImageUtils.loadTextureCube( imageURL );
  //texture.needsUpdate = true;
  /*
  //tiles
  ,skyboxtiles = this.skyboxtiles
  ,imageURL = this.skyboxtiles.imageURL
  //,materialArray = this.materialArray
  //,callback = ptv.callback
  //,image = ptv.previewImg
  //,imageSrc = ptv.imageSrc
  //,texture = image? new THREE.Texture( image ) : THREE.ImageUtils.loadTexture( imageSrc,new THREE.UVMapping(),callback )
  //,texture = new THREE.Texture( image )
  ,texture = skyboxtiles.texture
  ,material = new THREE.MeshBasicMaterial({
    blending:THREE.AdditiveBlending //TBD:remove if error
    //,map:texture //imagePrefix + directions[i] + imageSuffix
    ,side:THREE.BackSide
  })
  ;
  */
  //texture.needsUpdate = true;
  //material.map.needsUpdate = true;
  //texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  //texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearFilter;
  /*
  callbackData.material = material;
  callbackData.image = image;
  */
  //materialArray.push( material );
  
  //var imageURL = [ '0004.png', '0002.png', '0006.png', '0005.png', '0001.png', '0003.png' ];
  
  /*
  var texture = new THREE.Texture;
  texture.images = [];
  texture.images[ i ] = new Image;
  
  var texture = new THREE.CubeTexture( imageURL, mapping );
  texture.flipY = false; //no flipping needed for cube textures
  texture.images[ i ] = image;
  loaded += 1;
  if ( loaded === 6 ) {
    texture.needsUpdate = true;
  }  
  
  var texture = THREE.ImageUtils.loadTextureCube( imageURL ); //load textures

  var shader = THREE.ShaderLib[ "cube" ]; //init cube shader from built-in lib
  shader.uniforms[ "tCube" ].value = texture; //apply textures to shader

  // create shader material
  var skyMaterial = new THREE.ShaderMaterial( {
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
  });
*/
  //create skybox mesh
  
  //console.log("skyboxtiles: ");console.log(skyboxtiles);
  //if( skyboxtiles && skyboxtiles.loaded > (directions.length - 1) ) {
    var materialArray = [];
    for( var i=0; i<directions.length; i++ ) {
      //skyboxtiles.texture.images[i] = skyboxtiles.tiles[ directions[i] ].image;
      var mat = skyboxtiles.tiles[ directions[i] ].material;
      materialArray.push( mat );
    }
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    //console.log("skyMaterial: ");console.log(skyMaterial);
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );
  //}
 
  /*var shader = THREE.ShaderLib[ "cube" ];
  shader.uniforms[ "tCube" ].value = texture;
  console.log("texture:");console.log( texture );
  var skyMaterial = new THREE.ShaderMaterial( {
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
  });
  var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
  scene.add( skyBox );
  */
}


//-- EffectController
function EffectController( options ) {
  options = options || {};
  var effectController = {
    fogOn:false
    ,fogNear:50
    ,fogFar:500
    ,fogExp:false
    ,fogDensity:0.000004
    ,red:0.556
    ,green:0.616
    ,blue:0.573
  };
  $.extend( effectController, options );
  $.extend( this, effectController );
};
EffectController.prototype.onRender = function( delta, renderer, scene ) {
  var effectController = this;
  if( effectController && effectController.fogOn ) {
    var hex = (Math.floor(effectController.red * 255) << 16) | (Math.floor(effectController.green * 255) << 8) | (Math.floor(effectController.blue * 255));
    renderer.setClearColor(hex, 1);
    if( effectController.fogExp ) {
      scene.fog = new THREE.FogExp2(hex, effectController.fogDensity);
    }else {
      scene.fog = new THREE.Fog(
        hex
        ,effectController.fogNear
        ,(effectController.fogFar >= effectController.fogNear)? effectController.fogFar : effectController.fogNear
      );
    }
  }
};

//-- Tile
var Tile = function( options ) {
  options = options || {};
  
  this.tileSizePx = null;
  this.tileUnit = null;
  this.rotation = null;
  this.y0 = null;
  this.x0 = 0;
  this.z0 = 0;
  this.row = null;
  this.col = null;
  this.bbox = {};
  this.center = {};
  this.tileMesh = null
  this.tileConfig = null;
  this.tileName = "tileName";
  
  this.init( options );
};
Tile.prototype.init = function( options ) {
  this.tileSizePx = options.tileConfig.tileSizePx;
  this.tileUnit = options.tileConfig.tileUnit;
  this.rotation = options.tileConfig.rotation;
  this.y0 = options.tileConfig.y;
  
  if( options.w && options.h ) {
    this.x0 = -parseInt( this.tileUnit * options.w / 2 );
    this.z0 = parseInt( this.tileUnit * options.h / 2 );
  }
  this.position = options.position;
  this.row = options.row;
  this.col = options.col;
  this.bbox = options.bbox;
  //console.log("bbox: ");console.log(this.bbox);
  this.tileMesh = root.ThreeDWgt.Tile.createOneTile( this, options.tileUrl );
  return this;
};
Tile.prototype._setTileConfig = function( tile, tileUrl ) {
  this.tileConfig = options.tileConfig || {};
  this.tileSizePx = this.tileConfig.tileSizePx || this.tileSizePx;
  this.tileSize = new root.ThreeDWgt.Size({w:this.tileSizePx,h:this.tileSizePx});
  
  this.tileUnit = this.tileConfig.tileUnit || this.tileUnit;
  this.y0 = this.tileConfig.y || this.y0;
  this.tileName = this.tileConfig.tileName || this.tileName;
  this.rotation = this.tileConfig.rotation || this.rotation;
  
  return this;
};
Tile.createOneTile = function( tile, tileUrl ) {
  var tileUnit = tile.tileUnit
  ,rotation = tile.rotation
  ,position = tile.position
  ,geometry = new THREE.PlaneGeometry(tileUnit,tileUnit)
  ,texture = THREE.ImageUtils.loadTexture(tileUrl)
  ,col = tile.col
  ,row = tile.row
  ,x = tile.center.x = tile.x0 + col * tileUnit
  ,y = tile.center.y = tile.y0
  ,z = tile.center.z = tile.z0 - tile.row * tileUnit
  ,position = new THREE.Vector3(x,y,z)
  ,material = new THREE.MeshBasicMaterial({
    map:texture
    //,transparent:true
    //,overdraw:true
  });
  //console.log("tile["+col+"]["+row+"]");
  //console.log("x:"+x+", y:"+y+", z:"+z);
  tile.left = parseFloat( (x - tileUnit/2), 6);
  tile.bottom = parseFloat( (z - tileUnit/2), 6);
  tile.right = parseFloat( (x + tileUnit/2), 6);
  tile.top = parseFloat( (z + tileUnit/2), 6);
  
  tile.tileName = tile.tileName + '-' + tile.row + ',' + tile.col;
  
  material.map.needsUpdate = true;
  texture.needsUpdate = true;
  var tileMesh = new THREE.Mesh(geometry,material);
  tileMesh.position = position;
  tileMesh.receiveShadow = true;
  tileMesh.name = tile.tileName;
  for (var r in rotation) {
    tileMesh.rotation[r] = rotation[r];
  }
  return tileMesh;
};

//-- Grid
var Grid = function( map, options ) {
  this.map = map;
  this.w = null;
  this.h = null;
  this.center = null;
  this.bbox = null;
  this.tiles = null;
  this.hasGridLines = null;
  this.hasGridCenterCube = null;
  this.init( options );
};
Grid.prototype.init = function( options ) {
  var map = this.map
  ,tileConfig = map.tileConfig
  ,tileSizePx = map.tileSizePx
  ,resolution = map.getResolution()
  ,extent = map.getMaxExtent()
  ,bbox = this.bbox = map.getGb(extent,resolution,tileSizePx)
  ,goodResTile = map.getGoodResTile()
  ,x = ( bbox.right - bbox.left )
  ,y = ( bbox.top - bbox.bottom )
  ,w = this.w = Math.round( x/goodResTile )
  ,h = this.h = Math.round( y/goodResTile );
  
  this.gridWidth = w * tileConfig.tileUnit;
  this.gridHeight = h * tileConfig.tileUnit;
  
  this.hasGridLines = typeof tileConfig.hasGridLines !== 'undefined'? tileConfig.hasGridLines : false;
  this.hasGridCenterCube = typeof tileConfig.hasGridCenterCube !== 'undefined'?  tileConfig.hasGridCenterCube : false;
  this.tileCenterCube = typeof tileConfig.tileCenterCube !== 'undefined'?  tileConfig.tileCenterCube : false;
  
  if( !this.center ) {
    this.center = {
      lon:bbox.left + x/2
      ,lat:bbox.bottom + y/2
    };
  }
  
  //console.log("Grid extent is ");console.log(extent);
  //console.log("Grid good bbox is "); console.log(bbox);
  //console.log("Grid good ResTile is "); console.log(goodResTile);
  //console.log("Grid this.w is "); console.log(this.w);
  //console.log("Grid this.h is "); console.log(this.h);
  this._create( options );
  this.createGridCenter( options );
  //this.createBBoxLines();
};
Grid.prototype._create = function( options ) {
  var w = this.w
  ,h = this.h
  ,bbox = this.bbox
  ,map = this.map
  ,goodResTile = map.getGoodResTile()
  ,scene = map.scene
  ,urlSeed = map.getMapTilesUrl()
  ,tileCenterCube = this.tileCenterCube
  ,hasGridLines = this.hasGridLines
  ,restrictedExtent = map.restrictedExtent;
  
  //console.log("x0, y0, z0: ");console.log("x0:"+x0+", y0:"+y0+", z0:"+z0);
  var floor = new THREE.Object3D();
  for ( var i = 0; i < w; i++) { //column
    if( !this.tiles ) { this.tiles = []; }
    if( hasGridLines ) {
      var lineGeometryGrid = new THREE.Geometry();
      var verticesGridArray = lineGeometryGrid.vertices;
    }
    for ( var j = 0; j < h; j++) { //row
      if( !this.tiles[i] ) { this.tiles[i] = []; }
      
      var lon = bbox.left + i*goodResTile
      ,lat = bbox.bottom + j*goodResTile
      ,tileUrl = urlSeed + lon+','+lat+','+(lon+goodResTile)+','+(lat+goodResTile);
      
      this.tiles[i][j] = new root.ThreeDWgt.Tile({
        w:w
        ,h:h
        ,tileUrl:tileUrl
        ,row:j
        ,col:i
        ,bbox:{
          left:lon
          ,bottom:lat
          ,right:(lon+goodResTile)
          ,top:(lat+goodResTile)
        }
        ,tileConfig: map.tileConfig
      });
      var tile = this.tiles[i][j]
      ,x = tile.center.x, y = tile.center.y, z= tile.center.z, tileUnit = tile.tileUnit;
      
      //scene.add( tile.tileMesh );
      floor.add( tile.tileMesh );
      
      if( tileCenterCube ) {
        var cCube = new THREE.Mesh(
          new THREE.CubeGeometry( tileCenterCube.Sx, tileCenterCube.Sy, tileCenterCube.Sz )
          ,new THREE.MeshBasicMaterial({color: "#C80E12"})//0x00ff00
        );
        cCube.position.x = x;
        cCube.position.y = y + (tileCenterCube.Sy/2);
        cCube.position.z = z;
        scene.add(cCube);
      }
      if( hasGridLines ) {
        verticesGridArray.push(
          new THREE.Vector3(x - tileUnit/2, y, z + tileUnit/2)
          ,new THREE.Vector3(x - tileUnit/2, y, z - tileUnit/2)
          ,new THREE.Vector3(x + tileUnit/2, y, z + tileUnit/2)
          ,new THREE.Vector3(x + tileUnit/2, y, z - tileUnit/2)
        );
      }
    }
    if( hasGridLines ) {
      this.createGridLines( lineGeometryGrid, "#C80E12" );
    }
  }
  scene.add( floor );
  this.floor = floor;
};
Grid.prototype.createGridCenter = function( options ) {
  if( this.hasGridCenterCube && !this.map.scene.getObjectByName('gridCenterCube') ) {
    var x0 = parseInt( this.gridWidth/2 )/2;
    var y0 = this.map.tileConfig.y;
    var z0 = parseInt( this.gridHeight/2 )/2;
    
    var color = "#C80E12"; //Math.random()*0x00cc00;
    var Sx=20,Sy=20,Sz=20;
    var centerCube = new THREE.Mesh(
      new THREE.CubeGeometry(Sx,Sy,Sz)
      ,new THREE.MeshBasicMaterial({ color:color })
    )
    centerCube.position.x = x0;
    centerCube.position.y = y0+(Sy/2);
    centerCube.position.z = z0;
    centerCube.name = "gridCenterCube";
    this.map.scene.add(centerCube);
  }
};
Grid.prototype.createBBoxLines = function() {
  var color = "#007ac1";
  var lineGeometry = new THREE.Geometry();
  var verticesGridArray = lineGeometry.vertices;
  //add vertices
  var i = this.tiles.length - 1;
  var j = this.tiles[0].length - 1;
  
  var firstTile = this.tiles[0][0];
  var lastTile = this.tiles[i][j];
  var tileUnit = this.tiles[0][0].tileUnit;
  
  verticesGridArray.push(
    new THREE.Vector3(firstTile.center.x, firstTile.center.y, firstTile.center.z)
    ,new THREE.Vector3(firstTile.center.x , firstTile.center.y, firstTile.center.z + this.gridWidth)
  );
  lineGeometry.computeLineDistances();
  var lineMaterial = new THREE.LineDashedMaterial( { color:color } );
  var line = new THREE.Line( lineGeometry, lineMaterial );
  this.map.scene.add(line);
};
Grid.prototype.createGridLines = function( lineGeometry, color ) {
  color = color || "#C80E12";
  lineGeometry.computeLineDistances();
  //var lineMaterial = new THREE.LineDashedMaterial( { color:color, dashSize:2, gapSize:2 } );
  var lineMaterial = new THREE.LineDashedMaterial( { color:color } );
  var line = new THREE.Line( lineGeometry, lineMaterial );
  this.map.scene.add(line);
};
Grid.prototype.getWidth = function() {
  return this.gridWidth;
};
Grid.prototype.getHeight = function() {
  return this.gridHeight;
};

//-- Map
var Map = function(options) {
  this.projection = "EPSG:4326";
  this.units = "degrees";
  this.wrapDateLine = false;
  
  this.maxExtent = null; //this.maxExtent = [-180, -90, 180, 90]; //EPSG:4326 unit: degrees, yx: true
  this.restrictedExtent = null;
  this.maxPx = null;
  this.minPx = null;
  this.zoom = null;
  this.numZoomLevels = null;
  this.zoomLevel = null;
  
  this.size = null;
  this.tileConfig = {
    tileSizePx: root.ThreeDWgt.Map.DEFAULTS.TILE_SIZE
    ,tileUnit: root.ThreeDWgt.Map.DEFAULTS.TILE_UNIT
    ,rotation: root.ThreeDWgt.Map.DEFAULTS.TILE_ROTATION
    ,y: root.ThreeDWgt.Map.DEFAULTS.TILE_POS_Y
  };
  this.tileSize = null;
  this.tileSizePx = null;
  this.tileUnit = null;
  
  this.RESOLUTIONS = [];
  this.resolutions = [];
  this.maxResolution = null;
  this.minResolution = null;
  this.resolution = null;
  
  this.id = null;
  this.viewPortDiv = null;
  this.div = null;
  this.theme = null;
  this.controls = [];
  
  this.scene = null;
  
  this.options = options || {};
  
  this.init();
};

//-- Map.DEFAULTS
Map.DEFAULTS = {};
Map.DEFAULTS.TILE_SIZE = 256;
Map.DEFAULTS.TILE_UNIT = 256;
Map.DEFAULTS.TILE_POS_Y = -15;
Map.DEFAULTS.TILE_ROTATION = {x:-90*Math.PI/180};
Map.DEFAULTS.MIN_ZOOM_LEVEL = 0;
Map.DEFAULTS.MAX_ZOOM_LEVEL = 19;

Map.prototype.init = function() {
  //$.extend(this,options);
  this.viewPortDiv = this.options.viewPortDiv;
  this.div = document.getElementById(this.viewPortDiv);
  this.maxExtent = this.options.maxExtent? this.options.maxExtent : new root.ThreeDWgt.Bounds.fromString(root.cfg.maxExtent);
  this.restrictedExtent = this.options.restrictedExtent? this.options.restrictedExtent : this.maxExtent;
  
  this.minZoomLevel = this.options.minZoomLevel? this.options.minZoomLevel : null;
  this.maxZoomLevel = this.options.maxZoomLevel? this.options.maxZoomLevel : null;
  
  
  this.scene = this.options.scene;
  
  //initialize tile config
  this.options.tileConfig = $.extend( this.tileConfig, this.options.tileConfig );
  this.tileUnit =  this.tileConfig.tileUnit;
  this.tileSizePx = this.tileConfig.tileSizePx;
  this.tileSize = new root.ThreeDWgt.Size({w:this.tileSizePx,h:this.tileSizePx});
  
  this.size = this.getCurrentSize();
  
  //initialize zoomLevel and resolution
  this.initZoomLevelAndResolution();
  
  //set goodResTile
  this._setGoodResTile();
  
  this.grid = this.getGrid();
};
Map.prototype.initZoomLevelAndResolution = function() {
  var tileSizePx = this.tileSizePx;
  if( tileSizePx ) {
    for ( var i = 0; i < 20; i++) {
      this.RESOLUTIONS.push(180/( tileSizePx*Math.pow(2,i)) );
    }
  }
  
  if ( (this.minZoomLevel == null) || (this.minZoomLevel < root.ThreeDWgt.Map.DEFAULTS.MIN_ZOOM_LEVEL) ) {
    this.minZoomLevel = root.ThreeDWgt.Map.DEFAULTS.MIN_ZOOM_LEVEL;
  }
  
  var desiredZoomLevels; //the number of zoom levels we'd like to have.
  var limitZoomLevels = root.ThreeDWgt.Map.DEFAULTS.MAX_ZOOM_LEVEL - this.minZoomLevel + 1; //this is the maximum number of zoom levels the layer will allow, given the specified starting minimum zoom level.
  if( ((this.options.numZoomLevels == null) &&  (this.options.maxZoomLevel != null)) // (2)
       || ((this.numZoomLevels == null) && (this.maxZoomLevel != null)) // (4)
    ) {
       desiredZoomLevels = this.maxZoomLevel - this.minZoomLevel + 1; //calculate based on specified maxZoomLevel (on layer or map)
  }else {
    desiredZoomLevels = this.numZoomLevels; //calculate based on specified numZoomLevels (on layer or map) // this covers cases (1) and (3)
  }
  if( desiredZoomLevels != null ) {
    this.numZoomLevels = Math.min(desiredZoomLevels, limitZoomLevels);
  }else {
    this.numZoomLevels = limitZoomLevels; // case (5) -- neither 'numZoomLevels' not 'maxZoomLevel' was // set on either the layer or the map. So we just use the  // maximum limit as calculated by the layer's constants.
  }
  
  this.maxZoomLevel = this.minZoomLevel + this.numZoomLevels - 1; //now that the 'numZoomLevels' is appropriately, safely set, // we go back and re-calculate the 'maxZoomLevel'.
  
  var resolutionsIndex = 0;
  for(var i= this.minZoomLevel; i <= this.maxZoomLevel; i++) {
    this.resolutions[resolutionsIndex++] = this.RESOLUTIONS[i];
  }
  this.maxResolution = this.resolutions[0];
  this.minResolution = this.resolutions[this.resolutions.length - 1];
  
  var zoomAndResolution = this.getZoomAndResolutionFromBbox( this.getMaxExtent(), this.getViewPortWidthPx() );
  this.zoomLevel = zoomAndResolution.zoomLevel;
  this.resolution = zoomAndResolution.resolution;
  
  return this;
};
Map.prototype._setGoodResTile = function() {
  this.goodResTile = this.resolution * this.tileSizePx;
};
Map.prototype.getGoodResTile = function(resolution,tileSizePx) {
  var goodResTile = this.goodResTile;
  if( resolution && tileSizePx ) {
    goodResTile = resolution * tileSizePx;
  }
  return goodResTile;
};
Map.prototype.getZoomAndResolutionFromBbox = function(bbox,viewPortWidthPx) {
  var z = 0;
  var inRes = (bbox.right - bbox.left)/viewPortWidthPx
  ,resolutions = this.resolutions
  ,goodRes = null;
  
  for ( var i = 0; i < 20; i++) {
    goodRes = resolutions[i];
    z = i;
    if (inRes > resolutions[i]) { 
      break; 
    }
  }
  console.log("getZoomAndResolutionFromBbox:zoomLevel:resolution: ");console.log(z);console.log(goodRes);
  return {
    zoomLevel:z
    ,resolution:goodRes
  };
};
Map.prototype.getMaxResolution = function() {};
Map.prototype.getResolution = function() {
 return this.resolution;
};
Map.prototype.getResolutions = function() {
 return this.resolutions;
};
Map.prototype.getGrid = function() {
  var map = this;
  var grid = map.grid;
  if( !grid ) {
    grid = new root.ThreeDWgt.Grid( map, map.options );
  }
  return grid;
};
Map.prototype.destroyGrid = function() {
  this.grid = null;
};
Map.prototype.isValidLonLat = function() {};
Map.prototype.isValidZoomLevel = function() {};
Map.prototype.getScale = function() {};
Map.prototype.getUnits = function() {};
Map.prototype.getSize = function() {
  var size = null;
  if( this.size != null ) {
    size = this.size.clone();
  }
  return size;
};
Map.prototype.getCurrentSize = function() {
  var size = new root.ThreeDWgt.Size(this.div.clientWidth, this.div.clientHeight);

  if (size.w == 0 && size.h == 0 || isNaN(size.w) && isNaN(size.h)) {
    size.w = this.div.offsetWidth;
    size.h = this.div.offsetHeight;
  }
  if (size.w == 0 && size.h == 0 || isNaN(size.w) && isNaN(size.h)) {
    size.w = parseInt(this.div.width);
    size.h = parseInt(this.div.height);
  }
  if (size.w == 0 && size.h == 0 || isNaN(size.w) && isNaN(size.h)) {
    size.w = parseInt(this.div.style.width);
    size.h = parseInt(this.div.style.height);
  }
  return size;
};
Map.prototype.getTileSize = function() {};
Map.prototype.getViewport = function() {};
Map.prototype.getCenter = function() {
  var center = null;
  if( !this.center && this.size ) {
    this.center = this.getLonLatFromViewPortPx({ x:this.size.w / 2 ,y:this.size.h / 2 });
  }
  center = this.center.clone();
  return center;
};
Map.prototype.setCenter = function( lon, lat ) {
  //this.center = new root.ThreeDWgt.LonLat(lon, lat);
};
Map.prototype.updateSize = function() {};
Map.prototype.getViewPortSizePx = function() {
 var size = {
  w:$("#"+this.viewPortDiv).width()
  ,h:$("#"+this.viewPortDiv).height()
 };
 return size;
};
Map.prototype.getViewPortWidthPx = function() {
 return $("#"+this.viewPortDiv).width();
};
Map.prototype.getViewPortHeightPx = function() {
 return $("#"+this.viewPortDiv).height();
};
//Get a map location from a pixel location
Map.prototype.getLonLatFromViewPortPx = function(viewPortPx) {
  var lonlat = null;
  if (viewPortPx != null && this.minPx) {
    var res = this.getResolution();
    var maxExtent = this.getMaxExtent({restricted: true});
    var lon = (viewPortPx.x - this.minPx.x) * res + maxExtent.left;
    var lat = (this.minPx.y - viewPortPx.y) * res + maxExtent.top;
    lonlat = new root.ThreeDWgt.LonLat(lon, lat);

    if (this.wrapDateLine) {
        lonlat = lonlat.wrapDateLine(this.maxExtent);
    }
  }
  return lonlat;
};
Map.prototype.getLonLatFromPixel = function() {};
Map.prototype.getViewPortPxFromLonLat = function() {};
Map.prototype.getZoomForExtent = function() {};
Map.prototype.getPixelFromLonLat = function() {};
Map.prototype.getExtent = function() {
  var size = this.getSize();
  var tl = this.getLonLatFromViewPortPx({ x: 0, y: 0});
  var br = this.getLonLatFromViewPortPx({ x: size.w, y: size.h });
  if ((tl != null) && (br != null)) {
    return new root.ThreeDWgt.Bounds({left:tl.lon, bottom:br.lat, right:br.lon, top:tl.lat});
  } else {
    return null;
  }
};
Map.prototype.calculateBounds = function(center, resolution) {
  var extent = null;
  if (center == null) {
    center = this.getCachedCenter();
  }                
  if (resolution == null) {
    resolution = this.getResolution();
  }
  if ((center != null) && (resolution != null)) {
    var halfWDeg = (this.size.w * resolution) / 2;
    var halfHDeg = (this.size.h * resolution) / 2;
    extent = new OpenLayers.Bounds(center.lon - halfWDeg,
                                   center.lat - halfHDeg,
                                   center.lon + halfWDeg,
                                   center.lat + halfHDeg);
  }
  return extent;
};
Map.prototype.getMaxExtent = function() {
 return this.maxExtent;
};
Map.prototype.getContainingTileCoords = function(point, res) {
  return new root.ThreeDWgt.Pixel(
    Math.max(Math.floor((point.x - this.tileOrigin.lon) / (this.tileSize.w * res)),0),
    Math.max(Math.floor((this.tileOrigin.lat - point.y) / (this.tileSize.h * res)),0)
  );
};
//Since the max extent of a set of tiles can change from zoom level to zoom level, we need to be able to calculate that max extent  for a given resolution
Map.prototype.getMaxExtentForResolution = function(res) {
  var start = this.getUpperLeftTileCoord(res);
  var end = this.getLowerRightTileCoord(res);

  var numTileCols = (end.x - start.x) + 1;
  var numTileRows = (end.y - start.y) + 1;

  var minX = this.tileOrigin.lon + (start.x * this.tileSize.w * res);
  var maxX = minX + (numTileCols * this.tileSize.w * res);
  
  var maxY = this.tileOrigin.lat - (start.y * this.tileSize.h * res);
  var minY = maxY - (numTileRows * this.tileSize.h * res);
  return new root.ThreeDWgt.Bounds(minX, minY, maxX, maxY);
};
Map.prototype.getZoomLevel = function() {
  return this.zoomLevel;
};
Map.prototype.getNumZoomLevels = function() {};
Map.prototype.getZoomForResolution = function() {};
Map.prototype.getZoomTargetCenter = function() {};
Map.prototype.getMinZoom = function() {
  return this.adjustZoom(0);
};
Map.prototype.getZoom = function() {
  return this.zoom;
};
Map.prototype.zoomIn = function() {};
Map.prototype.zoomOut = function() {};
Map.prototype.zoomTo = function(zoom,xy) {};
Map.prototype.zoomToExtent = function(bounds, closest) {};
Map.prototype.zoomToMaxExtent = function( options ) {};
Map.prototype.zoomToScale = function(scale, closest) {};
Map.prototype.adjustZoom = function() {};
Map.prototype.moveByPx = function() {};
Map.prototype.moveTo = function() {};
Map.prototype.pan = function() {};
Map.prototype.panTo = function() {};
Map.prototype.getGbLon = function(lon,resolution,tileSizePx,gridWidth) {
  resolution = resolution || this.resolution;
  tileSizePx = tileSizePx || this.tileSizePx;
  gridWidth = gridWidth || 1;
  lon = parseFloat( lon, 6 );
  var goodLon = ((Math.floor((lon-(-180))/(tileSizePx*resolution)))*resolution*tileSizePx-180)/(gridWidth);;
  return goodLon;
};
Map.prototype.getGbLat = function(lat,resolution,tileSizePx,gridHeight) {
  resolution = resolution || this.resolution;
  tileSizePx = tileSizePx || this.tileSizePx;
  gridHeight = gridHeight || 1;
  lat = parseFloat( lat, 6 );
  //var goodLat=((Math.floor((90+lat)/(resolution*tileSizePx)))*resolution*tileSizePx-90)/(gridHeight);
  var goodLat=((Math.floor((lat-(-90))/(tileSizePx*resolution)))*resolution*tileSizePx-90);
  return goodLat; 
};
Map.prototype.getGb = function(bbox,resolution,tileSizePx) {
  var outBbox = new root.ThreeDWgt.Bounds({
    left:this.getGbLon(bbox.left,resolution,tileSizePx)
    ,bottom:this.getGbLat(bbox.bottom,resolution,tileSizePx)
    ,right:this.getGbLon(bbox.right,resolution,tileSizePx)+resolution*tileSizePx
    ,top:this.getGbLat(bbox.top,resolution,tileSizePx)+resolution*tileSizePx
  });
  return outBbox;
};
Map.prototype.getMapTilesUrl = function( options ) {
  //var bbox , bbox.left, bbox.bottom, bbox.right, bbox.top  interms of dd
  // tile size each is 256 px
  // how do you decide 1px means what dd?
  // called dd/px or px/dd - how do you decide it?
  // using wgs standards  - 
  // let us say we want to render the bbox in 1000px
  options = options || {};
  var tilecacheBaseUrl = root.cfg.tilecacheBaseUrl.replace(/210/g,'200')
  ,tilecacheBaseLayer = encodeURIComponent(root.cfg.tilecacheBaseLayer)
  ,format = encodeURIComponent('image/png')
  ,service = 'WMS'
  ,version = '1.1.1'
  ,request = 'GetMap'
  ,styles = ''
  ,srs = encodeURIComponent('EPSG:4326')
  ,width = 256
  ,height = 256
  ,url = tilecacheBaseUrl+'LAYERS='+tilecacheBaseLayer+'&FORMAT='+format+'&SERVICE='+service+'&VERSION='+version+'&REQUEST='+request+'&STYLES='+styles+'&SRS='+srs+'&WIDTH='+width+'&HEIGHT='+height+'&BBOX='
  ;
  //console.log(url);
  return url;
};
Map.prototype.lonLatToXZ = function(lon,lat) {
  var tileUnit = this.tileUnit
  ,goodResTile = this.goodResTile
  ,center = this.grid.center
  ,XZ = {
     x: ( tileUnit*( lon - center.lon)/goodResTile ) - tileUnit/2
    ,z: ( tileUnit*( center.lat - lat )/goodResTile ) + tileUnit/2
  };  
  return XZ;
};
//Map.prototype.addDataToScene = function( options, geometry, materials ) {};
//-- Util
var Util = {};
Util.DEFAULT_PRECISION = 14;
Util.IMAGE_RELOAD_ATTEMPTS = 0;
Util.CANVAS_SUPPORTED = (function() {
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
})();
Util.alphaHackNeeded = null;
Util.ddToMeters = function(dd) {
  return ( 6378137.0*3.141*parseFloat(dd,6)/180.0 );
};
Util.meterToDD = function(meter) {
  return ( parseFloat(meter,6)*180.0/(6378137.0*3.141) );
};
//Convenience method to cast an object to a Number, rounded to the desired floating point precision. Defaults to Util.DEFAULT_PRECISION. If set to 0, no rounding is performed
Util.toFloat = function (number, precision) {
  if( precision == null ) {
    precision = Util.DEFAULT_PRECISION;
  }
  if( typeof number !== "number" ) {
    number = parseFloat(number);
  }
  return precision === 0 ? number : parseFloat(number.toPrecision(precision));
};
//Tests that the provided object is an array. This test handles the cross-IFRAME case not caught by "a instanceof Array" and should be used instead. true if the object is an array.
Util.isArray = function(a) {
    return (Object.prototype.toString.call(a) === '[object Array]');
};
Util.extend = function(destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                destination[property] = value;
            }
        }

        /**
         * IE doesn't include the toString property when iterating over an object's
         * properties with the for(property in object) syntax.  Explicitly check if
         * the source has its own toString property.
         */

        /*
         * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
         * prototype object" when calling hawOwnProperty if the source object
         * is an instance of window.Event.
         */

        var sourceIsEvt = typeof window.Event == "function"
                          && source instanceof window.Event;

        if (!sourceIsEvt
           && source.hasOwnProperty && source.hasOwnProperty("toString")) {
            destination.toString = source.toString;
        }
    }
    return destination;
};

//-- Size
var Size = function( options ) {
  options = options || {};
  this.CLASS_NAME =  "Size";
  this.w = 0.0;
  this.h = 0.0;
  this.init( options );
};
Size.prototype.init = function( options ) {
  this.w = parseFloat(options.w,6);
  this.h = parseFloat(options.h,6);
};
Size.prototype.toString = function() {
  return ("w=" + this.w + ",h=" + this.h);
};
Size.prototype.clone = function() {
  return new root.ThreeDWgt.Size({w:this.w, h:this.h});
};
Size.prototype.equals = function(sz) {
  var equals = false;
  if (sz != null) {
    equals = ((this.w == sz.w && this.h == sz.h) ||
              (isNaN(this.w) && isNaN(this.h) && isNaN(sz.w) && isNaN(sz.h)));
  }
  return equals;
};

//-- Pixel
//Pixel: This class represents a screen coordinate, in x and y coordinates
var Pixel = function( options ) {
  options = options || {};
  this.CLASS_NAME = "Pixel";
  this.x = 0.0; //The x coordinate
  this.y = 0.0; //The y coordinate
  this.init( options );
};
Pixel.prototype.init = function(options) {
  this.x = parseFloat(options.x,6);
  this.y = parseFloat(options.y,6);
};
Pixel.prototype.toString = function() {
  return ("x=" + this.x + ",y=" + this.y);
};
Pixel.prototype.clone = function() {
  return new root.ThreeDWgt.Pixel({x:this.x, y:this.y}); 
};
Pixel.prototype.equals = function(px) {
  var equals = false;
  if( px != null ) {
    equals = ((this.x == px.x && this.y == px.y) ||
              (isNaN(this.x) && isNaN(this.y) && isNaN(px.x) && isNaN(px.y)));
  }
  return equals;
};
//Returns the distance to the pixel point passed in as a parameter.
Pixel.prototype.distanceTo = function(px) {
  return Math.sqrt( Math.pow(this.x - px.x, 2) + Math.pow(this.y - px.y, 2) );
};
// A new Pixel with this pixel's x&y augmented by the values passed in
Pixel.prototype.add = function(x, y) {
  if( (x == null) || (y == null) ) {
    throw new TypeError('Pixel.add cannot receive null values');
  }
  return new root.ThreeDWgt.Pixel({x:this.x + x, y:this.y + y});
};
// A new Pixel with this pixel's x&y augmented by the x&y values of the pixel passed in
Pixel.prototype.offset = function(px) {
  var newPx = this.clone();
  if( px ) {
    newPx = this.add(px.x, px.y);
  }
  return newPx;
};
//-- LonLat
var LonLat = function( options ) {
  this.CLASS_NAME = "LonLat";
  //lon - {Number} The x-axis coordinate in map units.  If your map is in
  //     a geographic projection, this will be the Longitude.  Otherwise,
  //     it will be the x coordinate of the map location in your map units.
  //lat - {Number} The y-axis coordinate in map units.  If your map is in
  //     a geographic projection, this will be the Latitude.  Otherwise,
  //     it will be the y coordinate of the map location in your map units.
  this.lon = 0.0; //The x-axis coodinate in map units
  this.lat = 0.0; //The y-axis coordinate in map units
  this.init( options );
};
//Create a new map location
LonLat.prototype.init = function( options ) {
  this.lon = root.ThreeDWgt.Util.toFloat( options.lon );
  this.lat = root.ThreeDWgt.Util.toFloat( options.lat );
};
//String representation of LonLat object (e.g. <i>"lon=5,lat=42"</i>)
LonLat.toString = function(lonlat) {
  return ("lon=" + lonlat.lon + ",lat=" + lonlat.lat);
};
//Shortened String representation of LonLat object (e.g. <i>"5, 42"</i>)
LonLat.toShortString = function(lonlat) {
  return (lonlat.lon + ", " + lonlat.lat);
};
//New LonLat object with the same lon and lat values
LonLat.clone = function(lonlat) {
  return new root.ThreeDWgt.LonLat({lon:lonlat.lon, lat:lonlat.lat});
};
//A new LonLat object with the lon and lat passed-in added to this's
LonLat.add = function(lonlat1,lonlat2) {
  if( (lonlat1 == null) || (lonlat2 == null) ) {
    throw new TypeError('LonLat.add cannot receive null values');
  }
  return new root.ThreeDWgt.LonLat({lon:lonlat1.lon + root.ThreeDWgt.Util.toFloat(lonlat2.lon), lat:lonlat1.lat + root.ThreeDWgt.Util.toFloat(lonlat2.lat)});
};
//Boolean value indicating whether the passed-in <LonLat> object has the same lon and lat components as this. If ll passed in is null, returns false
LonLat.prototype.equals = function(ll) {
  var equals = false;
  if (ll != null) {
    equals = ((this.lon == ll.lon && this.lat == ll.lat) ||
              (isNaN(this.lon) && isNaN(this.lat) && isNaN(ll.lon) && isNaN(ll.lat)));
  }
  return equals;
};
/**
 * APIMethod: transform
 * Transform the LonLat object from source to dest. This transformation is
 *    *in place*: if you want a *new* lonlat, use .clone() first.
 *
 * Parameters: 
 * source - {<Projection>} Source projection. 
 * dest   - {<Projection>} Destination projection. 
 *
 * Returns:
 * {<LonLat>} Itself, for use in chaining operations.
 */
LonLat.prototype.transform = function(source, dest) {
  var point = Projection.transform(
      {'x': this.lon, 'y': this.lat}, source, dest);
  this.lon = point.x;
  this.lat = point.y;
  return this;
};
/**
 * APIMethod: wrapDateLine
 * 
 * Parameters:
 * maxExtent - {<Bounds>}
 * 
 * Returns:
 * {<LonLat>} A copy of this lonlat, but wrapped around the 
 *                       "dateline" (as specified by the borders of 
 *                       maxExtent)
 */
LonLat.prototype.wrapDateLine = function(maxExtent) {
  var newLonLat = this.clone();
  if (maxExtent) {
      //shift right?
      while (newLonLat.lon < maxExtent.left) {
          newLonLat.lon +=  maxExtent.getWidth();
      }    
     
      //shift left?
      while (newLonLat.lon > maxExtent.right) {
          newLonLat.lon -= maxExtent.getWidth();
      }    
  }
          
  return newLonLat;
};

//-- Bounds
var Bounds = function( options ) {
  //bounding boxes
  //Data stored as left, bottom, right, top floats and All values are initialized to null
  //however, you should make sure you set them before using the bounds for anything.
  
  options = options || {};
  this.CLASS_NAME = "Bounds";
  this.left = null; //Minimum horizontal coordinate
  this.bottom = null; //Minimum vertical coordinate
  this.right = null; //Maximum horizontal coordinate
  this.top = null; //Maximum vertical coordinate
  this.centerLonLat = null; //centerLonLat
  this.init( options );
};
Bounds.fromString = function(str, reverseAxisOrder) {
  var bounds = str.split(",");
  return Bounds.fromArray(bounds, reverseAxisOrder);
};
Bounds.fromArray = function(bbox, reverseAxisOrder) {
  return reverseAxisOrder === true ?
         new root.ThreeDWgt.Bounds({bottom:bbox[1], left:bbox[0], top:bbox[3], right:bbox[2]}):
         new root.ThreeDWgt.Bounds({left:bbox[0], bottom:bbox[1], right:bbox[2], top:bbox[3]});
};
Bounds.fromSize = function(size) {
  return new root.ThreeDWgt.Bounds({left:0,bottom:size.h,right:size.w,top:0});
};
Bounds.oppositeQuadrant = function(quadrant) {
  var opp = "";
  opp += (quadrant.charAt(0) == 't') ? 'b' : 't';
  opp += (quadrant.charAt(1) == 'l') ? 'r' : 'l';
  return opp;
};
Bounds.prototype.init = function( options ) {
  var top = options.top
  ,right = options.right
  ,bottom = options.bottom
  ,left = options.left;
  if (left != null) {
    this.left = root.ThreeDWgt.Util.toFloat(left);
  }
  if (bottom != null) {
    this.bottom = root.ThreeDWgt.Util.toFloat(bottom);
  }
  if (right != null) {
    this.right = root.ThreeDWgt.Util.toFloat(right);
  }
  if (top != null) {
    this.top = root.ThreeDWgt.Util.toFloat(top);
  }
};
// Create a cloned instance of this bounds and returns a fresh copy of the bounds
Bounds.clone = function(bbox) {
  //var bbox = {left:left, bottom:bottom, right:right, top:top};
  return new root.ThreeDWgt.Bounds( bbox );
};
//The passed-in bounds object has the same left, right, top, bottom components as this. If bounds passed in is null, returns false
Bounds.equals = function( bounds1, bounds2 ) {
  var equals = false;
  if( bounds1 != null && bounds2 != null ) {
    equals = ((bounds1.left == bounds2.left) && 
              (bounds1.right == bounds2.right) &&
              (bounds1.top == bounds2.top) && 
              (bounds1.bottom == bounds2.bottom));
  }
  return equals;
};
//Returns a string representation of the bounds object
Bounds.toString = function( bounds ) {
  return [bounds.left, bounds.bottom, bounds.right, bounds.top].join(",");
};
//Returns an array representation of the bounds object
Bounds.prototype.toArray = function(bounds,reverseAxisOrder) {
  if( reverseAxisOrder === true ) {
    return [bounds.bottom, bounds.left, bounds.top, bounds.right];
  }else {
    return [bounds.left, bounds.bottom, bounds.right, bounds.top];
  }
};
/** 
 * APIMethod: toBBOX
 * Returns a boundingbox-string representation of the bounds object.
 * 
 * Parameters:
 * decimal - {Integer} How many significant digits in the bbox coords?
 *                     Default is 6
 * reverseAxisOrder - {Boolean} Should we reverse the axis order?
 * 
 * Returns:
 * {String} Simple String representation of bounds object.
 *          (e.g. "5,42,10,45")
 */
Bounds.toBBOX = function(bounds,decimal, reverseAxisOrder) {
  if( decimal== null ) {
    decimal = 6; 
  }
  var mult = Math.pow(10, decimal);
  var xmin = Math.round(bounds.left * mult) / mult;
  var ymin = Math.round(bounds.bottom * mult) / mult;
  var xmax = Math.round(bounds.right * mult) / mult;
  var ymax = Math.round(bounds.top * mult) / mult;
  if( reverseAxisOrder === true ) {
    return ymin + "," + xmin + "," + ymax + "," + xmax;
  }else {
    return xmin + "," + ymin + "," + xmax + "," + ymax;
  }
};
//Create a new polygon geometry based on this bounds
Bounds.toGeometry =  function(bounds) {
  //TBD
};
//Returns the width of the bounds. The width of the bounds (right minus left)
Bounds.getWidth = function(bounds) {
  return (bounds.right - bounds.left);
};
//Returns the height of the bounds. The height of the bounds (top minus bottom)
Bounds.getHeight = function(bounds) {
  return (bounds.top - bounds.bottom);
};
//Returns an <Size> object of the bounds
Bounds.getSize = function(bounds) {
  return new root.ThreeDWgt.Size({w:Bounds.getWidth( bounds ), h:Bounds.getHeight(bounds)});
};
//Returns the <Pixel> object which represents the center of the bounds
Bounds.getCenterPixel = function(bounds) {
  return new root.ThreeDWgt.Pixel({x:(bounds.left + bounds.right) / 2, y:(bounds.bottom + bounds.top) / 2});
};
/**
 * APIMethod: getCenterLonLat
 * Returns the <LonLat> object which represents the center of the
 *     bounds.
 *
 * Returns:
 * {<LonLat>} The center of the bounds in map space.
 */
Bounds.prototype.getCenterLonLat = function() {
  if(!this.centerLonLat) {
    this.centerLonLat = new root.ThreeDWgt.LonLat( {lon:(this.left + this.right) / 2, lat:(this.bottom + this.top) / 2} );
  }
  return this.centerLonLat;
};
//A new bounds that is scaled by ratio from origin. Bounds may return non-integer properties, even if a pixel.
Bounds.prototype.scale = function(ratio, origin){
  if(origin == null){
    origin = this.getCenterLonLat();
  }  
  var origx,origy;
  // get origin coordinates
  if(origin.CLASS_NAME == "LonLat"){
    origx = origin.lon;
    origy = origin.lat;
  }else {
    origx = origin.x;
    origy = origin.y;
  }

  var left = (this.left - origx) * ratio + origx;
  var bottom = (this.bottom - origy) * ratio + origy;
  var right = (this.right - origx) * ratio + origx;
  var top = (this.top - origy) * ratio + origy;
  return new root.ThreeDWgt.Bounds({left:left, bottom:bottom, right:right, top:top});
};
//A new bounds whose coordinates are the same as this, but shifted by the passed-in x and y values. Shifts the coordinates of the bound by the given horizontal and vertical deltas
Bounds.prototype.add = function(x, y) {
  if( (x == null) || (y == null) ) {
    throw new TypeError('Bounds.add cannot receive null values');
  }
  return new root.ThreeDWgt.Bounds({left:this.left + x, bottom:this.bottom + y, right:this.right + x, top:this.top + y});
};
// Extend the bounds to include the <LonLat>, <Geometry.Point> or <Bounds> specified. This function assumes that left < right and bottom < top
Bounds.prototype.extend = function(object) {
  if (object) {
    switch(object.CLASS_NAME) {
      case "LonLat":
          this.extendXY(object.lon, object.lat);
          break;
      case "Geometry.Point":
          this.extendXY(object.x, object.y);
          break;
      case "Bounds":
          // clear cached center location
          this.centerLonLat = null;
          if ( (this.left == null) || (object.left < this.left)) {
            this.left = object.left;
          }
          if ( (this.bottom == null) || (object.bottom < this.bottom) ) {
            this.bottom = object.bottom;
          }
          if ( (this.right == null) || (object.right > this.right) ) {
            this.right = object.right;
          }
          if ( (this.top == null) || (object.top > this.top) ) {
            this.top = object.top;
          }
          break;
    }
  }
};
//Extend the bounds to include the XY coordinate specified; x - {number} The X part of the the coordinate, y - {number} The Y part of the the coordinate
Bounds.prototype.extendXY = function(x, y) {
  // clear cached center location
  this.centerLonLat = null;
  if((this.left == null) || (x < this.left)) {
    this.left = x;
  }
  if((this.bottom == null) || (y < this.bottom)) {
    this.bottom = y;
  }
  if((this.right == null) || (x > this.right)) {
    this.right = x;
  }
  if((this.top == null) || (y > this.top)) {
    this.top = y;
  }
};
/**
 * APIMethod: containsLonLat
 * Returns whether the bounds object contains the given <LonLat>.
 * 
 * Parameters:
 * ll - {<LonLat>|Object} LonLat or an
 *     object with a 'lon' and 'lat' properties.
 * options - {Object} Optional parameters
 *
 * Acceptable options:
 * inclusive - {Boolean} Whether or not to include the border.
 *     Default is true.
 * worldBounds - {<Bounds>} If a worldBounds is provided, the
 *     ll will be considered as contained if it exceeds the world bounds,
 *     but can be wrapped around the dateline so it is contained by this
 *     bounds.
 *
 * Returns:
 * {Boolean} The passed-in lonlat is within this bounds.
 */
Bounds.prototype.containsLonLat = function(ll, options) {
  if (typeof options === "boolean") {
      options =  {inclusive: options};
  }
  options = options || {};
  var contains = this.contains(ll.lon, ll.lat, options.inclusive),
      worldBounds = options.worldBounds;
  if (worldBounds && !contains) {
      var worldWidth = worldBounds.getWidth();
      var worldCenterX = (worldBounds.left + worldBounds.right) / 2;
      var worldsAway = Math.round((ll.lon - worldCenterX) / worldWidth);
      contains = this.containsLonLat({
          lon: ll.lon - worldsAway * worldWidth,
          lat: ll.lat
      }, {inclusive: options.inclusive});
  }
  return contains;
};
/**
 * APIMethod: containsPixel
 * Returns whether the bounds object contains the given <Pixel>.
 * 
 * Parameters:
 * px - {<Pixel>}
 * inclusive - {Boolean} Whether or not to include the border. Default is
 *     true.
 *
 * Returns:
 * {Boolean} The passed-in pixel is within this bounds.
 */
Bounds.prototype.containsPixel = function(px, inclusive) {
  return this.contains(px.x, px.y, inclusive);
};
/**
 * APIMethod: contains
 * Returns whether the bounds object contains the given x and y.
 * 
 * Parameters:
 * x - {Float}
 * y - {Float}
 * inclusive - {Boolean} Whether or not to include the border. Default is
 *     true.
 *
 * Returns:
 * {Boolean} Whether or not the passed-in coordinates are within this
 *     bounds.
 */
Bounds.prototype.contains = function(x, y, inclusive) {
  //set default
  if (inclusive == null) {
      inclusive = true;
  }

  if (x == null || y == null) {
      return false;
  }

  x = root.ThreeDWgt.Util.toFloat(x);
  y = root.ThreeDWgt.Util.toFloat(y);

  var contains = false;
  if (inclusive) {
      contains = ((x >= this.left) && (x <= this.right) && 
                  (y >= this.bottom) && (y <= this.top));
  } else {
      contains = ((x > this.left) && (x < this.right) && 
                  (y > this.bottom) && (y < this.top));
  }              
  return contains;
};
/**
 * APIMethod: intersectsBounds
 * Determine whether the target bounds intersects this bounds.  Bounds are
 *     considered intersecting if any of their edges intersect or if one
 *     bounds contains the other.
 * 
 * Parameters:
 * bounds - {<Bounds>} The target bounds.
 * options - {Object} Optional parameters.
 * 
 * Acceptable options:
 * inclusive - {Boolean} Treat coincident borders as intersecting.  Default
 *     is true.  If false, bounds that do not overlap but only touch at the
 *     border will not be considered as intersecting.
 * worldBounds - {<Bounds>} If a worldBounds is provided, two
 *     bounds will be considered as intersecting if they intersect when 
 *     shifted to within the world bounds.  This applies only to bounds that
 *     cross or are completely outside the world bounds.
 *
 * Returns:
 * {Boolean} The passed-in bounds object intersects this bounds.
 */
Bounds.prototype.intersectsBounds = function(bounds, options) {
  if (typeof options === "boolean") {
      options =  {inclusive: options};
  }
  options = options || {};
  if (options.worldBounds) {
      var self = this.wrapDateLine(options.worldBounds);
      bounds = bounds.wrapDateLine(options.worldBounds);
  } else {
      self = this;
  }
  if (options.inclusive == null) {
      options.inclusive = true;
  }
  var intersects = false;
  var mightTouch = (
      self.left == bounds.right ||
      self.right == bounds.left ||
      self.top == bounds.bottom ||
      self.bottom == bounds.top
  );
  
  // if the two bounds only touch at an edge, and inclusive is false,
  // then the bounds don't *really* intersect.
  if (options.inclusive || !mightTouch) {
      // otherwise, if one of the boundaries even partially contains another,
      // inclusive of the edges, then they do intersect.
      var inBottom = (
          ((bounds.bottom >= self.bottom) && (bounds.bottom <= self.top)) ||
          ((self.bottom >= bounds.bottom) && (self.bottom <= bounds.top))
      );
      var inTop = (
          ((bounds.top >= self.bottom) && (bounds.top <= self.top)) ||
          ((self.top > bounds.bottom) && (self.top < bounds.top))
      );
      var inLeft = (
          ((bounds.left >= self.left) && (bounds.left <= self.right)) ||
          ((self.left >= bounds.left) && (self.left <= bounds.right))
      );
      var inRight = (
          ((bounds.right >= self.left) && (bounds.right <= self.right)) ||
          ((self.right >= bounds.left) && (self.right <= bounds.right))
      );
      intersects = ((inBottom || inTop) && (inLeft || inRight));
  }
  // document me
  if (options.worldBounds && !intersects) {
      var world = options.worldBounds;
      var width = world.getWidth();
      var selfCrosses = !world.containsBounds(self);
      var boundsCrosses = !world.containsBounds(bounds);
      if (selfCrosses && !boundsCrosses) {
          bounds = bounds.add(-width, 0);
          intersects = self.intersectsBounds(bounds, {inclusive: options.inclusive});
      } else if (boundsCrosses && !selfCrosses) {
          self = self.add(-width, 0);
          intersects = bounds.intersectsBounds(self, {inclusive: options.inclusive});                
      }
  }
  return intersects;
};
/**
 * APIMethod: containsBounds
 * Returns whether the bounds object contains the given <Bounds>.
 * 
 * bounds - {<Bounds>} The target bounds.
 * partial - {Boolean} If any of the target corners is within this bounds
 *     consider the bounds contained.  Default is false.  If false, the
 *     entire target bounds must be contained within this bounds.
 * inclusive - {Boolean} Treat shared edges as contained.  Default is
 *     true.
 *
 * Returns:
 * {Boolean} The passed-in bounds object is contained within this bounds. 
 */
Bounds.prototype.containsBounds = function(bounds, partial, inclusive) {
  if (partial == null) {
      partial = false;
  }
  if (inclusive == null) {
      inclusive = true;
  }
  var bottomLeft  = this.contains(bounds.left, bounds.bottom, inclusive);
  var bottomRight = this.contains(bounds.right, bounds.bottom, inclusive);
  var topLeft  = this.contains(bounds.left, bounds.top, inclusive);
  var topRight = this.contains(bounds.right, bounds.top, inclusive);
  
  return (partial) ? (bottomLeft || bottomRight || topLeft || topRight)
                   : (bottomLeft && bottomRight && topLeft && topRight);
};
/** 
 * APIMethod: determineQuadrant
 * Returns the the quadrant ("br", "tr", "tl", "bl") in which the given
 *     <LonLat> lies.
 *
 * Parameters:
 * lonlat - {<LonLat>}
 *
 * Returns:
 * {String} The quadrant ("br" "tr" "tl" "bl") of the bounds in which the
 *     coordinate lies.
 */
Bounds.prototype.determineQuadrant = function(lonlat) {
  var quadrant = "";
  var center = this.getCenterLonLat();
  quadrant += (lonlat.lat < center.lat) ? "b" : "t";
  quadrant += (lonlat.lon < center.lon) ? "l" : "r";
  return quadrant; 
};
/**
 * APIMethod: transform
 * Transform the Bounds object from source to dest. 
 *
 * Parameters: 
 * source - {<Projection>} Source projection. 
 * dest   - {<Projection>} Destination projection. 
 *
 * Returns:
 * {<Bounds>} Itself, for use in chaining operations.
 */
Bounds.prototype.transform = function(source, dest) {
  // clear cached center location
  this.centerLonLat = null;
  var ll = Projection.transform(
      {'x': this.left, 'y': this.bottom}, source, dest);
  var lr = Projection.transform(
      {'x': this.right, 'y': this.bottom}, source, dest);
  var ul = Projection.transform(
      {'x': this.left, 'y': this.top}, source, dest);
  var ur = Projection.transform(
      {'x': this.right, 'y': this.top}, source, dest);
  this.left   = Math.min(ll.x, ul.x);
  this.bottom = Math.min(ll.y, lr.y);
  this.right  = Math.max(lr.x, ur.x);
  this.top    = Math.max(ul.y, ur.y);
  return this;
};
/**
 * APIMethod: wrapDateLine
 * Wraps the bounds object around the dateline.
 *  
 * Parameters:
 * maxExtent - {<Bounds>}
 * options - {Object} Some possible options are:
 *
 * Allowed Options:
 *                    leftTolerance - {float} Allow for a margin of error 
 *                                            with the 'left' value of this 
 *                                            bound.
 *                                            Default is 0.
 *                    rightTolerance - {float} Allow for a margin of error 
 *                                             with the 'right' value of 
 *                                             this bound.
 *                                             Default is 0.
 * 
 * Returns:
 * {<Bounds>} A copy of this bounds, but wrapped around the 
 *                       "dateline" (as specified by the borders of 
 *                       maxExtent). Note that this function only returns 
 *                       a different bounds value if this bounds is 
 *                       *entirely* outside of the maxExtent. If this 
 *                       bounds straddles the dateline (is part in/part 
 *                       out of maxExtent), the returned bounds will always 
 *                       cross the left edge of the given maxExtent.
 *.
 */
Bounds.prototype.wrapDateLine = function(maxExtent, options) {    
  options = options || {};
  
  var leftTolerance = options.leftTolerance || 0;
  var rightTolerance = options.rightTolerance || 0;

  var newBounds = this.clone();

  if (maxExtent) {
      var width = maxExtent.getWidth();

      //shift right?
      while (newBounds.left < maxExtent.left && 
             newBounds.right - rightTolerance <= maxExtent.left ) { 
          newBounds = newBounds.add(width, 0);
      }

      //shift left?
      while (newBounds.left + leftTolerance >= maxExtent.right && 
             newBounds.right > maxExtent.right ) { 
          newBounds = newBounds.add(-width, 0);
      }
     
      // crosses right only? force left
      var newLeft = newBounds.left + leftTolerance;
      if (newLeft < maxExtent.right && newLeft > maxExtent.left && 
             newBounds.right - rightTolerance > maxExtent.right) {
          newBounds = newBounds.add(-width, 0);
      }
  }       
  return newBounds;
};

//-- ThreeDWgt
function ThreeDWgt( options ) {
  options = options || {};
  var threeDWgtConfig = {
    domId:"3dWgt"
    //,hasConfig:true 
    ,appendTo:"vidteq-wrapper"
    ,templateId:"vPopupFullScreenTemplate3"
    ,buttons:[{display:"3D"}]
    ,buttonsImage:false
    ,hiddenOnCreate:false
    ,theme:'nemo'
    //,toggle:false
    ,domContainer:true
    ,initialized:false
    ,opened:false
    ,threeDPoi:null
    ,skyview:true
    ,skybox:{
       has:true
      ,world:null
      ,skytheme:'night',imageType:'.png'
      //,skytheme:'evening',imageType:'.jpg'
      ,xyz:3584
      ,x:null
      ,y:null
      ,z:null
    }
    ,particle:{
      has:true
      ,effects:{
         magical:null
        ,fountain:null
        ,fireball:null
        ,smoke:null
        ,clouds:null
        ,snow:null
        ,starfield:null
        ,fireflies:null
        ,startunnel:null
        ,firework:null
        ,candle:null
      }
      ,particleGroup:null
      ,particleAttributes:null
      ,engine:null
    }
    ,cameraConfig:{
      FOV:85
      ,NEAR:0.1
      //,FAR:20000//6378137
      ,FAR:10240//6378137
      //,position:{x:0,y:950,z:900}
      //,position:{x:0,y:100,z:400}
      //,position:{x:0,y:130,z:160}
      //,position:{x:-15,y:120,z:260}
      ,position:{x:0,y:120,z:0}
      //,position:{x:0,y:10,z:40}
      ,target:{x:0,y:0,z:0}
      ,hasCameraControls:true
      ,cameraControlsOptions:{
        maxPolarAngle:1.5
        ,canRotateLeftRight:true
        ,autoRotate:true
        ,autoRotateUpDown:false
        ,autoRotateLeftRight:true
        ,onMouseDownButton:{
           PAN:2
          ,DOLLY:1
          ,ROTATE:0
        }
        ,onMouseDownCallback:this.onMouseDownCallback
        ,canPanLeftRight:true
        ,canPanUpDown:true
        ,rotateOnPan:false
        ,rotateSpeed: 0.2
      }
    }
    ,centerModel:{Sx:2,Sy:16,Sz:2} //false or {Sx:2,Sy:10,Sz:2}
    ,objectScale:{Sx:10,Sy:10,Sz:10}
    ,areaCircle:true
    ,hasDebugAxis:false
    ,has360Rotation:false
    ,floorType:"maptile"
    //,floorType:"none"
    //,floorType:"checkerboard"
    ,floors:{
      none:"none"
      ,pos_y:-15
      ,solid:"solid"
      ,wireframe:"wireframe"
      ,checkerboard:"checkerboard"
      ,maptile:{
        id:"maptile"
        ,name:"maptile"
        ,tileSizePx:256
        ,tileUnit:256 //128
        ,y:-15
        ,tileCenterCube:false //false or {Sx:2,Sy:10,Sz:2}
        ,hasGridLines:false
        ,hasGridCenterCube:false
      }
    }
    ,effectController:true
    ,directFs:true
    ,loading:false
    ,noMarkers:false
    ,markersModel:true
    ,hasCanvasHidden:false
    ,iconUrlOnLoad:true
    //,imgUrlOnLoad:false
    ,viewerId:"viewer"
    ,manner:null
    ,map:null
    ,explorationArea:null
    ,uiwidget:null
    ,categories:null
    ,venue360:null
    ,callback:null
    ,callbackDataForVenue360:null
    ,callbackVenue360:{
      after:{
        loadedAllTiles:this.afterLoadedAllTiles
        ,popupOpens:this.afterPopupOpens
        ,init3js:this.afterInit3js
      }
      //,on:{}
    }
    ,menuObjects:[]
    ,onRender:[]
    //,onHover:[]
    //,onClick:[]
  };
  
  $.extend( threeDWgtConfig, options );
  $.extend( this, threeDWgtConfig );
};
ThreeDWgt.prototype.initialize = function() {
  var threeConfig = this.config
  ,c = threeConfig.cameraConfig
  ,position = c.position
  ,target = c.target
  ,FOV = c.FOV, FAR = c.FAR, minFov = c.NEAR, maxFov = c.FAR, NEAR = c.NEAR
  ;
  this.initScene({
    fov:FOV
    ,far:FAR
    ,minFov:minFov
    ,maxFov:maxFov
    ,near:NEAR
    ,position:position
    ,target:target
  });
  if( threeConfig.hasDebugAxis ) {
    this.debugaxis( FAR );
  }
  if( threeConfig.skybox && threeConfig.skybox.has ) {
    threeConfig.skybox.world = new root.ThreeDWgt.Skybox({
      imgPath: threeConfig.getImagePath()
      ,config: threeConfig.skybox
    });
    threeConfig.skybox.world.create({
      scene: this.scene
      ,xyz: threeConfig.cameraConfig.FAR
    });
  }
  if( threeConfig.particle && threeConfig.particle.has ) {
    //threeConfig._createParticleGroup.call(this);
    threeConfig.particle.effects = new root.ThreeDWgt.ParticleEffects();
    threeConfig.particle.engine = new root.ThreeDWgt.ParticleEngine();
    threeConfig.particle.engine.setValues( threeConfig.particle.effects.starfield );
    //threeConfig.particle.engine.setValues( threeConfig.particle.effects.fireflies );
    //threeConfig.particle.engine.setValues( threeConfig.particle.effects.clouds );
    threeConfig.particle.engine.initialize( {scene: this.scene} );
    /*threeConfig.particle.engine = [];
    for( var e in threeConfig.particle.effects ) {
       var engine = new root.ThreeDWgt.ParticleEngine();
      threeConfig.particle.engine.push( engine );
      engine.setValues(threeConfig.particle.effects[e] );
      engine.initialize( {scene: this.scene} );
    }*/
  }
};
ThreeDWgt.prototype.onMouseDownCallback = function( e, orbitPanControl, venue360 ) {
  //console.log("ThreeDWgt: onMouseDownCallback:this: ");console.log( this );
  var autoRotate = false;
  venue360.ui.addPauseClass();
  return autoRotate;
};
ThreeDWgt.prototype.afterLoadedAllTiles = function( options ) {
  options = options || {};
  this.config.setPoi.call( this, options );
};
ThreeDWgt.prototype.afterPopupOpens = function( el_popup ) {
  //console.log("afterPopupOpens:");
  var i = 1,x=5,d=1;
  var T = 1000/10;
  var animTimeout = 0;
  function tick(i,x){
    i = i+x;
    return i;
  }
  function animation() {
    //var time = Date.now();
    i = tick(i,x);
    el_popup.css({
      "opacity":i/T
    });
    if( (i/T) < d ) {
      animTimeout = setTimeout(animation, T);
    }else {
      clearTimeout(animTimeout);
    }
  }
  animation();
};
ThreeDWgt.prototype.afterInit3js = function( data ) {
  //console.log("threeDWgt: init3js: data: ");console.log(data);
  var threeConfig = this.config;
  threeConfig.loading = true;
  //1. Initialize Sequence
  threeConfig.initialize.call( this );
  //2. Set Flooring
  threeConfig.setFloor.call( this );
  //3. Set Lightings
  threeConfig.setLights.call( this );
  //4. Take Positions
  //threeConfig.fillScene.call( this, data );
  //5. Roll Camera
  threeConfig.rollCamera.call( this );
  //6. Action!
  threeConfig.action.call( this );
  threeConfig.ready = true;
  //console.log("threeDWgt: init3js:debugPoint-1");
  
  var cb_onAfterInit3js = ( threeConfig.callback || {} ).onAfterInit3js;
  if( cb_onAfterInit3js && typeof cb_onAfterInit3js === 'function' ) {
    cb_onAfterInit3js( threeConfig );
  }
};
ThreeDWgt.prototype.map3dOpenAnimation = function( options ) {
  //animate 3D map - opening
  options = options || {};
  
  var beforeAnimation = options.beforeAnimation
  ,onAnimation = options.onAnimation
  ,afterAnimation = options.afterAnimation
  ,el_map = options.el_map || $("#map")
  ,threeConfig = this;
  
  if( beforeAnimation && typeof beforeAnimation === "function" ) {
    beforeAnimation( threeConfig );
  }
  
  function tick(i,x){
    i = i+x;
    return i;
  }
  var i = 2,T=1000/10,d=45,x=2;
  var animTimeout=0;
  var done = false;
  function map3dCssStyle(){
    var el_mapParent = el_map.parent();
    el_mapParent.css({
      "transform-style":"preserve-3d"
      ,"perspective":"500px"
      ,"perspective-origin":"50% 70%"
      ,"-webkit-perspective":"all 2s ease-in-out"
      ,"-moz-transition":"all 2s ease-in-out"
      ,"-o-transition":"all 2s ease-in-out"
      ,"transition":"all 2s ease-in-out"
    });
  }

  function animation(){
    var time = Date.now();
    i = tick(i,x);
    var s = 1 + Math.abs( 1 - (i*0.05) );
    
    if( onAnimation && typeof onAnimation === "function" ) {
      onAnimation(T,i);
    }
    el_map.css({
      "transform":"rotateX("+i+"deg) translate3d(0,"+-(i*4.5)+"px,0) scale3d("+s+","+s+",1)"
    });
    if( i <= d ) {
      animTimeout = setTimeout(animation, T);
      if( i > d/3 && !done ) {
        done = true;
        if( afterAnimation && typeof afterAnimation === "function" ) {
          afterAnimation( threeConfig );
        }
      }
    }else {
      el_map.attr("data-rotateX",i);
      el_map.attr("data-translate3d",-(i*4.5));
      el_map.attr("data-scale3d",s);
      clearTimeout(animTimeout);
    }
  }
  map3dCssStyle();
  animation();
};
ThreeDWgt.prototype.map3dCloseAnimation = function( options ) {
  //animate 3D map - closing
  options = options || {};
  
  var beforeAnimation = options.beforeAnimation
  ,onAnimation = options.onAnimation
  ,afterAnimation = options.afterAnimation
  ,el_map = options.el_map || $("#map")
  ,cb_onMap3dCloseAnimation = ( this.callback || {} ).onMap3dCloseAnimation
  ,threeConfig = this;
  
  if( beforeAnimation && typeof beforeAnimation === "function" ) {
    beforeAnimation( threeConfig );
  }
  
  var T = 1000/10;
  var x=5,i=T-x,d1=1;
  var y=2,j=2,d2=45;
  var animTimeout = 0;
  function minusTick(a,b){
    a = a-b;
    return a;
  }
  function plusTick(a,b){
    a = a+b;
    return a;
  }
  el_map = el_map || $("#map");
  var rotateX = parseFloat(el_map.attr("data-rotateX"),6);
  var translate3d = parseFloat(el_map.attr("data-translate3d"),6);//-(i*4.5)
  var scale3d = parseFloat(el_map.attr("data-scale3d"),6);//(i*0.05)
  
  function revertMap3dCssStyle() {
    var el_mapParent = el_map.parent();
    el_mapParent.css({
      "transform-style":""
      ,"perspective":""
      ,"perspective-origin":""
      ,"-webkit-perspective":""
      ,"-moz-transition":""
      ,"-o-transition":""
      ,"transition":""
    });
  }
  
  function animation() {
    //var time = Date.now();
    i = minusTick(i,x);
    j = plusTick(j,y);
    var s = scale3d/(j*0.05);
    
    if( onAnimation && typeof onAnimation === "function" ) {
      onAnimation(T,i);
    }
    el_map.css({
      "transform":"rotateX("+(rotateX-j)+"deg) translate3d(0,"+(translate3d/(j*4.5))+"px,0) scale3d("+s+","+s+",1)"
    });
    if( 0 < i/T && i/T < d1 ) {
      animTimeout = setTimeout(animation, T);
    }else {
      clearTimeout(animTimeout);
      el_map.css({
        //"transform":"rotateX(0deg) translate3d(0,0,0) scale3d(1,1,1)"
        "transform":""
      });
      if( afterAnimation && typeof afterAnimation === "function" ) {
        afterAnimation( threeConfig );
      }
      if( cb_onMap3dCloseAnimation && typeof cb_onMap3dCloseAnimation === "function" ) {
        cb_onMap3dCloseAnimation( threeConfig );
      }
    }
  }
  revertMap3dCssStyle();
  animation();
};
//ThreeDWgt and Venue360UI/Venue360 should be able to co-exist
//ThreeDWgt.prototype.replace_inVenue360UI_closeFs = function() {
ThreeDWgt.prototype.closeFs = function() {
  //console.log("closeFs:");
  this.venue360.cleanUpTheScene();
  var threeConfig = this.venue360.config;
  threeConfig.menuObjects = [];
  threeConfig.threeDPoi = null;
  var cb_onCloseFs = ( this.callback || {} ).onCloseFs;
  if( threeConfig ) {
    if( cb_onCloseFs && typeof cb_onCloseFs === "function" ) {
      cb_onCloseFs( threeConfig );
    }else {
      //TBD: should not be hardcoded
      threeConfig.map3dCloseAnimation({
        afterAnimation:function() {
          $("#popupContact2-1").remove();
        }
        ,onAnimation:function(T,i) {
           $("#popupContact2-1").css({
            "opacity":i/T
          });
        }
      });
    }
  }
};
ThreeDWgt.prototype.onDoRayProjection = function( event ) {
  //console.log("nemo.category: onDoRayProjection: ");
  
  //TBD: use array to conveniently add multiple custom onDoRayProjection effects
  var threeConfig = this.config
  ,threeDPoi = threeConfig.threeDPoi
  ,skyview = threeConfig.skyview;
  
  if( threeDPoi  && typeof threeDPoi === "object" ) {
    threeDPoi.onHover( event );
  }
  if( skyview && typeof skyview === "object" ) {
    skyview.onHover( event );
    skyview.onClick( event );
  }
};
ThreeDWgt.prototype.getTexture = function( options ) {
  options = options || {};
  var src = options.src
  ,crossOrigin = options.crossOrigin
  ,poiImg = new Image()
  ,texture
  ;
  poiImg.src = src;
  if( crossOrigin ) {
    poiImg.crossOrigin = crossOrigin;//"anonymous";
  }
  //texture = THREE.ImageUtils.loadTexture(src);
  //texture = new THREE.Texture(poiImg);
  texture  = new THREE.Texture(
    poiImg
    ,new THREE.UVMapping()
    ,THREE.RepeatWrapping
    ,THREE.RepeatWrapping
    ,THREE.NearestFilter
    ,THREE.LinearMipMapLinearFilter
  );
  texture.needsUpdate = true;
  return texture;
};
ThreeDWgt.prototype.getThreeDModelsPath = function() {
  return root._serverHostUrl? root._serverHostUrl + "threeD" : "threeD"
};
ThreeDWgt.prototype.getImagePath = function( type ) {
  var uiwidget = this.uiwidget
  ,url = root._serverHostUrl? root._serverHostUrl + "images" : "images"
  ;
  if( type == 'icon' ) {
    url = url+"/themes/"+this.theme+"/nemo/categories";
  }
  if( type == 'poiimg' ) {
    url = (uiwidget.cfg || root.cfg).cloneImageUrl.replace(/210/g, '200'); //TBD: if crossOrigin/CORS enabled
  }
  if( type == 'markers' ) {
    url = root._serverHostUrl? root._serverHostUrl : "";
  }
  return url;
};
//following two rotation functions are updated versions of code from: https://github.com/mrdoob/three.js/issues/1219
//updated to work in latest versions (r52 tested) of THREE.js
// Rotate an object around an axis in object space
ThreeDWgt.prototype.rotateAroundObjectAxis = function( object, axis, radians ) {
  var rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationAxis( axis.normalize(), radians );
  object.matrix.multiplySelf( rotationMatrix ); // post-multiply
  object.rotation.setEulerFromRotationMatrix(object.matrix, object.order);
};
// Rotate an object around an axis in world space (the axis passes through the object's position)
ThreeDWgt.prototype.rotateAroundWorldAxis = function( object, axis, radians ) {
  var rotWorldMatrix;
  rotWorldMatrix = new THREE.Matrix4();
  rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
  rotWorldMatrix.multiplySelf(object.matrix); // pre-multiply
  object.matrix = rotWorldMatrix;
  object.rotation.setEulerFromRotationMatrix(object.matrix, object.order);
};
/**
 * Function: objArc
 * creates an arc (a linestring with n segments)
 *
 * Parameters:
 * center   - center point
 * radius   - radius of the arc
 * alpha    - starting angle (in Grad)
 * omega    - ending angle   (in Grad)
 * segments - number of segments for drawing the arc
 * flag     - true  : create arc feature from center to start- to endpoint to center
 *            false : create arc feature from start- to endpoint
 *
 * Returns: an array with four features, if flag=true
 *          arc feature     (from Linestring)
 *          the startpoint  (from Point)
 *          the endpoint    (from Point)
 *          the chord       (from LineString)
 */
ThreeDWgt.prototype.objArc = function(center, radius, alpha, omega, segments, flag) {
  var pointList=[];
  if(flag) {
    pointList.push( new THREE.Vector3(center.x, center.y, center.z) ); //new OpenLayers.Geometry.Point(center.x, center.y);
  }
  var dAngle= segments+1;
  for( var i=0; i<dAngle; i++ ) {
    var Angle = alpha - (alpha-omega)*i/(dAngle-1);
    var x = center.x + radius*Math.cos(Angle*Math.PI/180);
    var y = center.y + radius*Math.sin(Angle*Math.PI/180);
    var z = center.z + radius*Math.sin(Angle*Math.PI/180);
    //var point = new OpenLayers.Geometry.Point(x, y);
    var point = new THREE.Vector3(x, y, z);
    pointList.push(point);
  }
  if(flag) {
    pointList.push(new OpenLayers.Geometry.Point(center.x, center.y));
  }
  var ftArc = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointList));
  if(flag){
    var ftArcPt0 = new OpenLayers.Feature.Vector(pointList[1]);
    var ftArcPt1 = new OpenLayers.Feature.Vector(pointList[pointList.length-2]);
    var ftArcSehne = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([pointList[1], pointList[pointList.length-2]]));
    var arrArc = [ftArc, ftArcPt0, ftArcPt1, ftArcSehne];
  }else {
    var arrArc = [ftArc];
  }
  return(arrArc);
};
ThreeDWgt.prototype.createMesh = function(geom) {
  // assign two materials
  var meshMaterial = new THREE.MeshNormalMaterial();
  meshMaterial.side = THREE.DoubleSide;
  var wireFrameMat = new THREE.MeshBasicMaterial();
  wireFrameMat.wireframe = true;
  // create a multimaterial
  var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial]);
  return mesh;
};
ThreeDWgt.prototype.addShape = function( group, shape, extrudeSettings, color, x, y, z, rx, ry, rz, s ) {
  //var points = shape.createPointsGeometry();
  //var spacedPoints = shape.createSpacedPointsGeometry( 100 );
  
  // flat shape
  var geometry = new THREE.ShapeGeometry( shape );
  var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshLambertMaterial( { color: color } ), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } ) ] );
  //mesh.position.set( x, y, z - 125 );
  mesh.position.set( x, y, z);
  //mesh.rotation.set( rx, ry, rz );
  //mesh.scale.set( s, s, s );
  group.add( mesh );

  // 3d shape
  /*var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
  var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshLambertMaterial( { color: color } ), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } ) ] );
  mesh.position.set( x, y, z - 75 );
  mesh.rotation.set( rx, ry, rz );
  mesh.scale.set( s, s, s );
  group.add( mesh );*/
  
  // solid line
  /*var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: 2 } ) );
  line.position.set( x, y, z + 25 );
  line.rotation.set( rx, ry, rz );
  line.scale.set( s, s, s );
  group.add( line );*/

  // transparent line from real points
  /*var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, opacity: 0.5 } ) );
  line.position.set( x, y, z + 75 );
  line.rotation.set( rx, ry, rz );
  line.scale.set( s, s, s );
  group.add( line );*/

  // vertices from real points
  /*var pgeo = points.clone();
  var particles = new THREE.PointCloud( pgeo, new THREE.PointCloudMaterial( { color: color, size: 2, opacity: 0.75 } ) );
  particles.position.set( x, y, z + 75 );
  particles.rotation.set( rx, ry, rz );
  particles.scale.set( s, s, s );
  group.add( particles );
  */
  // transparent line from equidistance sampled points
  /*var line = new THREE.Line( spacedPoints, new THREE.LineBasicMaterial( { color: color, opacity: 0.2 } ) );
  line.position.set( x, y, z + 125 );
  line.rotation.set( rx, ry, rz );
  line.scale.set( s, s, s );
  group.add( line );*/

  // equidistance sampled points
  /*var pgeo = spacedPoints.clone();
  var particles2 = new THREE.PointCloud( pgeo, new THREE.PointCloudMaterial( { color: color, size: 2, opacity: 0.5 } ) );
  particles2.position.set( x, y, z + 125 );
  particles2.rotation.set( rx, ry, rz );
  particles2.scale.set( s, s, s );
  group.add( particles2 );*/
};
ThreeDWgt.prototype.action = function() {
  /*var canvas = $('#'+this.viewerId).children("canvas");
  $(canvas).qtip({
    overwrite: false, // Make sure the tooltip won't be overridden once created
    content: ' ',
    position: {
        viewport: $(canvas),
        target: 'mouse',
        my: 'top left',
        at: 'bottom left'
    },
    style: { tip: false, classes: 'qtip-bootstrap' },
    show: { delay: 500 },
    events : {
      render :   function(event, api){
        api.set('content.text', "hello webGL");//tooltipText
          api.show();
      },
      hide :function(event){
        $(this.canvas).qtip("destroy");
      }
    }
  });*/
  this.animate();
};
ThreeDWgt.prototype.rollCamera = function() {
  var threeConfig = this.config
  ,cameraConfig = threeConfig.cameraConfig
  ,x = cameraConfig.position.x
  ,y = cameraConfig.position.y
  ,z = cameraConfig.position.z
  ,target = cameraConfig.target
  ,renderer = this.renderer
  ,camera = this.camera
  ,scene = this.scene
  // initialize object to perform world/screen calculations
  //,projector = this.projector = new THREE.Projector()
  ;
  //camera.rotation.x = -45*(Math.PI/180);
  camera.position.set( x, y, z);
  //camera.lookAt(scene.position);
  
  //hack to update the camera target
  this.cameraControls.target.x = target.x;
  this.cameraControls.target.y = target.y;
  this.cameraControls.target.z = target.z;
  
  //TBD: where to put???
  // create a canvas element
  var canvasText = document.createElement('canvas');
  var contextCanvasText = canvasText.getContext('2d');
  
  contextCanvasText.font = "Bold 20px Arial";
  contextCanvasText.fillStyle = "rgba(0,0,0,0.95)";
  contextCanvasText.fillText('Hello, world!', 0, 20);
  // canvas contents will be used for a texture
  threeConfig.INTERSECTED = null;
  threeConfig.contextCanvasText = contextCanvasText;
  threeConfig.contextCanvasTextTexture = new THREE.Texture(canvasText) 
  threeConfig.contextCanvasTextTexture.needsUpdate = true;
};
ThreeDWgt.prototype.fillScene = function( data ) {
  var scene = this.scene;
  var x,
    z;
    for (x = - 4500; x <= 4500; x += 1000) {
      for (z = - 4500; z <= 4500; z += 1000) {
        var blockMaterial = new THREE.MeshLambertMaterial();
        blockMaterial.color.setRGB(((x + 4500) % 373) / 373, ((x + z + 9000) % 283) / 283, ((z + 4500) % 307) / 307);
        blockMaterial.ambient.copy(blockMaterial.color);
        //var block = new THREE.Mesh(new THREE.BoxGeometry(100, 300, 100), blockMaterial);
        var block = new THREE.Mesh(new THREE.CubeGeometry(100, 300, 100), blockMaterial);
        block.position.set(x, 150, z);
        scene.add(block);
      }
    }
};
ThreeDWgt.prototype.setLights = function() {
  var scene = this.scene;
  //--- Ambient
  scene.add(new THREE.AmbientLight(2236962));
  //--- Directional
  var light = new THREE.DirectionalLight(16777215, 1);
  light.position.set(200, 400, 500);
  scene.add(light);
  light = new THREE.DirectionalLight(16777215, 1);
  light.position.set( - 400, 200, - 300);
  scene.add(light);
  //--- Point
  this.headlight = new THREE.PointLight(16777215, 0.3);
  scene.add(this.headlight);
};
ThreeDWgt.prototype.setFloor = function() {
  var threeConfig = this.config
  ,cameraConfig = threeConfig.cameraConfig || {}
  ,floors = threeConfig.floors
  ,floorType = threeConfig.floorType
  ,pos_y0 = floors.pos_y
  ,FOV = cameraConfig.FOV
  ,FAR = cameraConfig.FAR
  ,minFov = cameraConfig.NEAR
  ,maxFov = cameraConfig.FAR
  ,NEAR = cameraConfig.NEAR
  ,scene = this.scene
  ,group = new THREE.Object3D()
  ,effectController = threeConfig.effectController
  ;
  
  if( effectController ) {
    effectController = new root.ThreeDWgt.EffectController();
    if( effectController.fogOn ) {
      var hex = (Math.floor(effectController.red * 255) << 16) | (Math.floor(effectController.green * 255) << 8) | (Math.floor(effectController.blue * 255));
      scene.fog = new THREE.Fog(
        hex
        ,effectController.fogNear
        ,(effectController.fogFar >= effectController.fogNear)? effectController.fogFar : effectController.fogNear
      );
      //threeConfig.onRender.push( effectController.onRender );
      threeConfig.onRender.push( { _call:effectController, onRender:onRender } );
    }
  }
  
  if( floors[floorType] ) {
    var tileName = floors[floorType].name || floors[floorType];
    
    if( tileName === "maptile" ) {
      var maxExtent = root.mboxObj.map.getExtent();
      //var maxExtent = root.mboxObj.map.maxExtent;
      //var center = root.mboxObj.map.getCenter();
      
      //nemo specific explorationArea definition
      var explorationArea = threeConfig.explorationArea;
      var map = threeConfig.map = new root.ThreeDWgt.Map({
        viewPortDiv:this.viewerId
        ,minZoomLevel:10
        ,maxZoomLevel:18
        ,maxExtent:{
            left:maxExtent.left
            ,right:maxExtent.right
            ,top:maxExtent.top
            ,bottom:maxExtent.bottom
        }
        //,center:explorationArea
        ,tileConfig:floors[floorType]
        ,scene:scene
      });
      
      var centerLonLat = explorationArea.geom.replace(/[^\s\d.]/g,'').split(/ /)
      ,XZ = map.lonLatToXZ( parseFloat( centerLonLat[0], 6 ), parseFloat( centerLonLat[1], 6 ) ) //explorationArea center
      ,pos_x0 = XZ.x
      ,pos_z0 = XZ.z
      ,pos_y0 = floors[floorType].y;
      
      //hack to update the camera target
      threeConfig.cameraConfig.target = { x:pos_x0, y:pos_y0, z:pos_z0 };
      
      var areaCircle = threeConfig.areaCircle;
      if( areaCircle && !scene.getObjectByName('areaCircle') && explorationArea.distance ) {
        var _radius = (function() {
          var ddppx = root.ThreeDWgt.Util.meterToDD( explorationArea.distance )
          ,R = map.tileUnit * ( ddppx/map.goodResTile );
          return R;
        })();
        var _y = threeConfig.cameraConfig.position.y;
        //threeConfig.cameraConfig.position = { x:pos_x0 + _radius, y:_y ,z:pos_z0 + _radius };
        threeConfig.cameraConfig.position = { x:pos_x0, y:_y ,z:pos_z0 + _radius };
        
        var line = threeConfig.getCircleLine({
          position:{ x:pos_x0, y:pos_y0+2, z:pos_z0 } //put the circle some units above the ground
          ,orientation:'XZ'
          ,radius:_radius
        });
        line.name = 'areaCircle';
        scene.add(line);
      }
      
      var centerModel = threeConfig.centerModel;
      if( centerModel && !scene.getObjectByName('centerCube') ) {
        var Sx = centerModel.Sx, Sy = centerModel.Sy, Sz = centerModel.Sz;
        /*var cubeMats = [];
        for( var i = 0; i < 6; i ++ ) {
          cubeMats.push(new THREE.MeshBasicMaterial({color:Math.random()*0x00cc00}));
        }*/
        
        /*var centerCube = new THREE.Mesh(
          new THREE.CubeGeometry( Sx, Sy, Sz )
          ,new THREE.MeshBasicMaterial({color:Math.random()*0x00cc00})//0x00ff00
        )
        centerCube.position.x = pos_x0;
        centerCube.position.y = pos_y0+(Sy/2);
        centerCube.position.z = pos_z0;
        centerCube.name = "centerCube";
        //centerCube.geometry.colorsNeedUpdate = true;
        scene.add(centerCube);
        */
        var loader = new THREE.JSONLoader();
        var path = threeConfig.getThreeDModelsPath();
        var scope = this;
        var theme = threeConfig.theme;
        //console.log("theme: ");console.log(theme);
        function addModelToScene( geometry, materials, centerEntity ) {
          var material = new THREE.MeshFaceMaterial( materials );
          var centerCube = new THREE.Mesh( geometry, material );
          //centerCube.scale.set(Sx, Sy, Sz);
          centerCube.position.x = pos_x0;
          centerCube.position.y = pos_y0;
          centerCube.position.z = pos_z0;
          centerCube.name = "centerCube";

          //centerCube.userData = threeConfig.centerUserData(explorationArea);
          centerCube.userData = threeConfig.centerUserData( centerEntity );
          
          scene.add(centerCube);
          threeConfig.menuObjects.push( centerCube );
          
          if( threeConfig.skyview ) {
            centerCube.geometry.computeBoundingBox();
            loader.load( path+"/"+theme+"/markers/marker-skyview.json", function(geometry, materials) {
              threeConfig.skyview = new root.ThreeDWgt.Skyview({
                centerCube: centerCube
                ,geometry: geometry
                ,materials: materials
                ,world: scope
                ,threeConfig: threeConfig
              });
            });
          }
          
          threeConfig.projectPopupFTInvoke(centerCube);
        }
        loader.load( path+"/"+theme+"/buildings/building-1.json", function(geometry, materials) {
          addModelToScene( geometry, materials, root.aD.places.center.entity );
        });
      }
      
    }else {
      if( tileName === "solid" ) {
        var floorGeometry = new THREE.PlaneGeometry(FAR, FAR);
        var floorMaterial = new THREE.MeshPhongMaterial({
          color:16777215
          ,polygonOffset:true
          ,polygonOffsetFactor:1
          ,polygonOffsetUnits:4
        });
      }else if( tileName === "wireframe" ) {
        var floorGeometry = new THREE.PlaneGeometry(256000, 256000, 256, 256);
        var floorMaterial = new THREE.MeshBasicMaterial({
          color: 0
          ,wireframe: true
        });
      }else if( tileName === "checkerboard" ) {
        var floorTexture = new THREE.ImageUtils.loadTexture( 'images/nemo/threeD/'+floorType+'.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
        floorTexture.repeat.set( 10, 10 );
        var floorMaterial = new THREE.MeshBasicMaterial({
          map:floorTexture
          ,side:THREE.DoubleSide
          ,transparent:true
          ,overdraw:true
        });
        var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
      }
      
      if( floorGeometry && floorMaterial ) {
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = Math.PI / 2; //- Math.PI / 2;
        floor.position.y = pos_y0;
        floor.name = tileName;
        scene.add(floor);
      }
      
    }
    
  }
  
};
ThreeDWgt.prototype.centerUserData = function( explorationArea ) {
  if( !explorationArea.address ) { return false; }
  var areaName = "";
  if(explorationArea.address.addr1) {
    areaName+=explorationArea.address.addr1;
  }
  if(explorationArea.address.addr2) {
    areaName+=(areaName!="")?", "+explorationArea.address.addr2:explorationArea.address.addr2;
  }
  var location = "";
  if(explorationArea.address.addr3) {
    location+=explorationArea.address.addr3;
  }
  if(explorationArea.address.addr4) {
    location+=(location!="")?", "+explorationArea.address.addr4:explorationArea.address.addr4;
  }
  var centerUserData = {
    address:{
      name:explorationArea.address.name
    }
    ,color:"#c80e12"
    ,geom:explorationArea.geom
    ,icon:(explorationArea.icon && explorationArea.icon.mapUrl) ? explorationArea.icon.mapUrl : ''
    ,image:explorationArea.image
    ,name:explorationArea.address.name
    ,phone:explorationArea.phone?explorationArea.phone:''
    ,website:explorationArea.website?explorationArea.website:''
    ,distance:''
    ,location:location
    ,areaName:areaName
    ,pin:(explorationArea.address.pin) ? explorationArea.address.pin : ''
  };
  return centerUserData;
};
ThreeDWgt.prototype.projectPopupFTInvoke = function(poi) {
  var imgUrl = root.cfg.cloneImageUrl.replace(/210/g, '200')+poi.userData.image;
  var city = ( root.cfg.city || '' ).charAt(0).toUpperCase()+root.cfg.city.slice(1);
  var catColor = "#a87c2c"; //pretige theme color default
  var el_poiInfo = $('#nemo-poi3d-info');
  
  if( $.isEmptyObject( $.template("poiPopup3D") ) ) {
    $.template( "poiPopup3D", $("#"+root.template['poiPopup3D']) );
  }
  //console.log("poi.userData: ");console.log(poi.userData);
  var poiInfo = $.tmpl("poiPopup3D", {
    data:poi.userData
    ,color:catColor
    ,img:imgUrl
    ,city:city
    ,font:"Trajan Pro"
  }, root.template.helper )[0];
            
  /*var poiInfo = $('#vPopupFullScreenTemplate4').tmpl({
    data:poi.userData
    ,color:catColor
    ,img:imgUrl
    ,city:city ,font:"Trajan Pro"
  });*/
  el_poiInfo.html(poiInfo);
  el_poiInfo.show();
};
ThreeDWgt.prototype.getPosition = function( obj, delta ) {
  //Assuming the flooring is in XZ plane
  var objPos = obj.position.clone();
  //var pos = { x:objPos.x, y:objPos.y, z:objPos.z };
  
  delta = typeof delta !== 'undefined'? delta : 2;
  
  objPos.y = objPos.y > 0 ? objPos.y + delta : objPos.y - delta;
  
  return objPos;
};
ThreeDWgt.prototype.getConcentricCircleLine = function( options ) {
  var R = (function( threeConfig ) {
    var R = [];
    var radius = options.radius || 100;
    for( var i=0; i<5; i++ ) {
      var ddppx = root.ThreeDWgt.Util.meterToDD( radius );
      R.push( threeConfig.map.tileUnit * ( ddppx/threeConfig.map.goodResTile ) );
      radius = radius - 15;
    }
    return R;
  })( this );
  //var lineGeo = new THREE.Geometry();
  var lineGeo = new THREE.Object3D();
  for( var i=0; i<R.length; i++ ) {
    var circle = this.getCircleLine( options, R[i] );
    //THREE.GeometryUtils.merge( lineGeo, circle );
    lineGeo.add( circle );
  }
  return lineGeo;
};
ThreeDWgt.prototype.getCircleLine = function( options, _radius ) {
  options = options || {};
  
  var position = options.position
  ,orientation = options.orientation || 'XZ'
  ,color = options.color || "#EE9900"
  ,R = _radius || options.radius
  ,N = 100
  ,K = 360 / N
  ,geometry = new THREE.Geometry()
  ,vertices = geometry.vertices
  ,material = new THREE.LineBasicMaterial( { color: color, opacity: 1.0} ) //0xFFFFFF
  ;
  for(var i = 0; i <= N; i++) {
    var segment = ( i * K ) * Math.PI / 180
    ,a = Math.cos( segment ) * R
    ,b = 0
    ,c = Math.sin( segment ) * R
    ,vect;
    
    if( orientation === 'XZ' ) {
      vect  = new THREE.Vector3( a, b, c );
    }else if( orientation === 'YZ' ) {
      vect  = new THREE.Vector3( b, a, c );
    }else if( orientation === 'XY' ) {
      vect  = new THREE.Vector3( a, c, b );
    }
    vertices.push( vect );
  }
  var line = new THREE.Line( geometry, material );
  line.position.set( position.x, position.y, position.z );
  return line;
};
ThreeDWgt.prototype.getCurvedLineFromSpline = function( tip1, tip2, color ) {
  var tip1V3 = new THREE.Vector3( tip1.x, tip1.y, tip1.z );
  var tip2V3 = new THREE.Vector3( tip2.x, tip2.y, tip2.z);
  var midV3 = new THREE.Vector3( tip1.x + (tip2.x - tip1.x)/2, 15 , tip1.z + (tip2.z - tip1.z)/2 );
  
  var spline = new THREE.SplineCurve3([ tip1V3, midV3 ,tip2V3 ]);
    
  var lineMaterial = new THREE.LineBasicMaterial({
      color: color //0xff00f0
      ,dashSize:2
      ,gapSize:10
  });
  //var lineMaterial = new THREE.LineDashedMaterial( { color: color, dashSize: 4, gapSize: 2 } );
  var geometry = new THREE.Geometry();
  var points = spline.getPoints(50);
  for(var i = 0; i < points.length; i++){
      geometry.vertices.push(points[i]);
  }
  var line = new THREE.Line(geometry, lineMaterial);
  return line;
};
ThreeDWgt.prototype.hidePoi = function( options ) {
  if( this.config.threeDPoi ) {
    this.config.threeDPoi.hidePoi( options );
  }
};
ThreeDWgt.prototype.setPoi = function( options ) {
  options = options || {};
  if( !( options.category && options.category.data ) ) { return; }
  
  if( !this.config.threeDPoi ) {
    this.config.threeDPoi = new root.ThreeDWgt.ThreeDPoi( this.config );
  }
  var markersModel = this.config.markersModel;
  //console.log("markersModel options:");console.log(options);
  if( markersModel ) {
    var that = this;
      var loader = new THREE.JSONLoader();
      var path = this.config.getThreeDModelsPath();
      var index = options.category.index;
      var theme = this.config.theme;
      loader.load( path+"/"+theme+"/markers/marker-"+index+".json", function(geometry, materials ) {
        //TBD: cache model for subsequent calls
        /*that.config.markersModel = {
          geometry:geometry
          ,materials:materials
        };*/
        that.config.threeDPoi.addDataToMap( options, geometry, materials );
      });
  }else {
    this.config.threeDPoi.addDataToMap( options );
  }
};

/* ThreeDWgt.ImageUtils */
ThreeDWgt.ImageUtils = function( options ) {
  this.options = options;
};
ThreeDWgt.ImageUtils.loadImage = function( options ) {
  options = options || {};
  var file = options.file
  ,callback = options.callback
  ,callbackData = options.callbackData
  ,responseType = options.responseType
  ,httpMethod = options.httpMethod || 'GET'
  ,overrideMimeType = options.overrideMimeType
  ;
  var convertResponseBodyToText = function(binary) {
    var byteMapping = {};
    for ( var i = 0; i < 256; i++ ) {
        for ( var j = 0; j < 256; j++ ) {
            byteMapping[ String.fromCharCode( i + j * 256 ) ] =
                String.fromCharCode(i) + String.fromCharCode(j);
        }
    }
    var rawBytes = IEBinaryToArray_ByteStr(binary);
    var lastChr = IEBinaryToArray_ByteStr_Last(binary);
    return rawBytes.replace(/[\s\S]/g,function( match ) { return byteMapping[match]; }) + lastChr;
  };
  
  var that = this;
  var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest()      // Mozilla/Safari/IE7+
    : (window.ActiveXObject) ?  new ActiveXObject("MSXML2.XMLHTTP")  // IE6
      : null;  // Commodore 64?
  
  //xhr.open('GET', '/path/to/image.png', true);
  xhr.open(httpMethod,file,true);
  if( this.isIe && this.ieVer == 11 ) {
    xhr.responseType = 'arraybuffer'; //Besides IE it may work in other browsers TBD
  }else if( window.ArrayBuffer ) {
    xhr.responseType = 'arraybuffer';
  }else if( xhr.overrideMimeType ) {
    xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );
  }else {
    xhr.setRequestHeader("Accept-Charset", "x-user-defined");
  }
  if( responseType ) { xhr.responseType = responseType; }
  if( overrideMimeType ) { xhr.overrideMimeType = overrideMimeType; }
  
  var ptv = {offset:-1};
  xhr.onreadystatechange = function(evt) {
    if( this.readyState != 4 && this.readyState != 3 ) { return; }
    //TBD needed ?
    if( this.readyState == 3 && this.status != 200 ) { return; }
    if( this.readyState == 4 && this.status != 200 ) {
        // TBD let us look at it later
        //clearInterval(pollTimer);
        //inProgress = false;   
    }
    var resp = undefined;
    if( that.isIe && that.ieVer < 10 ) {
      if( that.ieVer == 10 ) { // TBD temporary till we figure out
        if( this.readyState == 4 && this.status == 200 ) { } else { return; }
      }
      var bodyReady = true;
      try {
        resp = convertResponseBodyToText(this.responseBody);
      }catch(e) {
        bodyReady = false; 
      }
      if( !bodyReady ) { return ; }
      if( !resp.length ) { return ; }
      if( !('prevLength' in ptv) || resp.length != ptv.prevLength ) { } else { return; }
      ptv.prevLength = resp.length; 
    }else if( that.isIe && that.ieVer == 11 ) { 
      try {
        resp = this.response;
      }catch(e) {}
    }else {
      resp = this.response;
    }
    
    if( resp ) {
      if( responseType === 'blob' ) {
        window.URL = window.URL || window.webkitURL;
        var img = new Image();
        img.onload = function(e) {
          window.URL.revokeObjectURL(img.src); //Clean up after yourself.
        };
        img.src = window.URL.createObjectURL(resp);
        callback(img,resp,callbackData);
      }else {
        //ThreeDWgt.ImageUtils.parsePtv(resp,ptv);
        callback(resp,ptv);
      }
    }
  };
  /*
  window.URL = window.URL || window.webkitURL;
  xhr.onload = function(e) {
    if (this.status == 200) {
      var resp = this.response;
      if(resp) {
        var img = new Image();
        img.onload = function(e) {
          window.URL.revokeObjectURL(img.src); //Clean up after yourself.
        };
        img.src = window.URL.createObjectURL(resp);
        callback(img,resp,callbackData);
      }
    }
  };
  xhr.onload = function(evt) {    
    if (xhr.response) {
      callback(new Uint16Array(xhr.response));
    }
  };
  xhr.send(null);
  */
  xhr.send();
};

ThreeDWgt.create = {
  //-- Create lights
  hemisphereLight:function() {
    var tLight	= new THREE.HemisphereLight();
    return tLight;
  }
  ,directionalLight:function() {
    var tLight	= new THREE.DirectionalLight();
    return new tLight;
  }
  ,spotLight:function() {
    var tLight	= new THREE.SpotLight();
    return tLight;
  }
  ,pointLight:function() {
    var tLight	= new THREE.PointLight();
    return tLight;
  }
  ,ambientLight:function() {
    var tLight	= new THREE.AmbientLight();
    return tLight;
  }
  //-- Create Object3D
  ,object3D:function() {
    var object3d	= new THREE.Object3D();
    return object3d;
  }
  ,cube:function() {
    var ctor	= THREE.CubeGeometry;
    var dflGeometry	= [1, 1, 1];
    return this.mesh(ctor, dflGeometry, arguments);
  }
  ,torus:function() {
    var ctor	= THREE.TorusGeometry;
    var dflGeometry	= [0.5-0.15, 0.15];
    return this.mesh(ctor, dflGeometry, arguments);
  }
  ,torusKnot:function() {
    var ctor	= THREE.TorusKnotGeometry;
    var dflGeometry	= [0.27, 0.1, 128, 32];
    return this.mesh(ctor, dflGeometry, arguments);
  }
  ,circle:function() {
    var ctor	= THREE.CircleGeometry;
    var dflGeometry	= [0.5, 32];
    return this.mesh(ctor, dflGeometry, arguments);
  }
  ,sphere:function() {
    var ctor	= THREE.SphereGeometry;
    var dflGeometry	= [0.5, 32, 16];
    return this.mesh(ctor, dflGeometry, arguments);
  }
  ,cylinder:function() {
    var ctor	= THREE.CylinderGeometry;
    var dflGeometry	= [0.5, 0.5, 1, 16, 4];
    return this.mesh(ctor, dflGeometry, arguments);
  }
  ,plane:function(){
    var ctor	= THREE.PlaneGeometry;
    var dflGeometry	= [1, 1, 16, 16];
    return this.mesh(ctor, dflGeometry, arguments);
  }
  ,mesh:function(ctor, dflGeometry, args) {
    // convert args to array if it is instanceof Arguments
    // FIXME if( args instanceof Arguments )
    args	= Array.prototype.slice.call( args );
    
    // init the material
    var material	= new THREE.MeshNormalMaterial();
    // if the last arguments is a material, use it
    if( args.length && args[args.length-1] instanceof THREE.Material ) {
      material	= args.pop();
    }
    // ugly trick to get .apply() to work 
    var createFn	= function(ctor, a0, a1, a2, a3, a4, a5, a6, a7){
      console.assert(arguments.length <= 9);
      //console.log("createFn", arguments)
      return new ctor(a0,a1,a2,a3,a4,a5,a6,a7);
    }
    if( args.length === 0 )	args	= dflGeometry.slice();
    args.unshift(ctor);
    var geometry	= createFn.apply(this, args);

    // set the geometry.dynamic by default
    geometry.dynamic= true;
    // create the THREE.Mesh
    var mesh	= new THREE.Mesh(geometry, material)
    // return it
    return mesh;
  }
  ,vector3:function(x, y, z) {
    // handle parameters
    if( arguments.length === 0 ){
      return new THREE.Vector3()
    }else if( arguments[0] instanceof THREE.Vector3 && arguments.length === 1 ){
      return arguments[0]
    }else if( typeof arguments[0] === "number" && arguments.length === 3 ){
      return new THREE.Vector3(arguments[0], arguments[1], arguments[2]);
    }else if( arguments[0] instanceof Array && arguments.length === 1 ){
      return new THREE.Vector3(arguments[0][0], arguments[0][1], arguments[0][2]);
    }else{
      console.assert(false, "invalid parameter for Vector3");
    }
  }
  ,vector2:function(x, y) {
    return new THREE.Vector2(x, y);
  }
};
ThreeDWgt.prototype._createParticleGroup = function( options ) {
  options = options || {};
  var position = options.position;
  var threeConfig = this.config;
  var particleTexture = THREE.ImageUtils.loadTexture( 'images/nemo/threeD/spark.png' );
  var particleGroup = threeConfig.particle.particleGroup = new THREE.Object3D();
  var particleAttributes = threeConfig.particle.particleAttributes = { startSize: [], startPosition: [], randomness: [] };
  var totalParticles = 200;
  var radiusRange = 50;
  for( var i = 0; i < totalParticles; i++ ) {
    var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, useScreenCoordinates: false, color: 0xffffff } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set( 32, 32, 1.0 ); // imageWidth, imageHeight
    sprite.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
    // for a cube:
    // sprite.position.multiplyScalar( radiusRange );
    // for a solid sphere:
    // sprite.position.setLength( radiusRange * Math.random() );
    // for a spherical shell:
    sprite.position.setLength( radiusRange * (Math.random() * 0.1 + 0.9) );
    // sprite.color.setRGB( Math.random(),  Math.random(),  Math.random() ); 
    sprite.material.color.setHSL( Math.random(), 0.9, 0.7 );
    // sprite.opacity = 0.80; // translucent particles
    sprite.material.blending = THREE.AdditiveBlending; // "glowing" particles
    particleGroup.add( sprite );
    // add variable qualities to arrays, if they need to be accessed later
    particleAttributes.startPosition.push( sprite.position.clone() );
    particleAttributes.randomness.push( Math.random() );
  }
  threeConfig.addParticleGroup.call( this, position );
};
ThreeDWgt.prototype.addParticleGroup = function(position) {
  position = position || {};
  var threeConfig = this.config;
  var scene = this.scene;
  var particleGroup = threeConfig.particle.particleGroup;
  if( position.x ) particleGroup.position.x = position.x;
  if( position.y ) particleGroup.position.y = position.y;
  if( position.z ) particleGroup.position.z = position.z;
  scene.add( particleGroup );
  threeConfig.particle.hasParticleGroup = true;
};

var ThreeDPoi = function( options ) {
  options = options || {}
  this.data = null;
  this.config = options;
  this.world = options.venue360; //TBD: if venue360 name is dropped, to be changed respectivey
  this.init( options );
};
ThreeDPoi.prototype.init = function( options ) {
  //if( options.building )
  this.building = new root.ThreeDWgt.Building( options );
};
ThreeDPoi.prototype.showPoi = function( cat ) {
  if( cat && this.data && this.data[cat] && this.data[cat].length ) {
    var scene = this.world.scene;
    for( var i=0, len=this.data[cat].length; i < len; i++ ) {
      scene.add( this.data[cat][i] );
      this.data[cat][i].visible = true;
    }
    return true;
  }
  return false;
};
ThreeDPoi.prototype.spliceCategoryData = function( options ) {
  var spliceIdx = [];
  var threeConfig = this.config;
  for( var i in options.category.data) {
    var lonLat = root.mboxObj.lonLatObjFrmPoint(options.category.data[i].geom);
    if( !threeConfig.map.grid.bbox.containsLonLat(lonLat) ) {
      spliceIdx.push(i);
    }
  }
  for(var i=spliceIdx.length-1;i>=0;i--) {
    options.category.data.splice(spliceIdx[i],1);
  }
};
ThreeDPoi.prototype.addDataToMap = function( options, geometry, materials ) {
  //TBD: put nemo image path in imagePath Object
  var category = options.category
  ,cat = category.itemId;
  
  if( this.showPoi( cat ) ) {
    return false;
  }
  
  var icon = options.icon || category.icon;
  //TBD: re-drawing 3D map tiles
  //splice category data so it does not goes out of 3D map tiles
  this.spliceCategoryData( options );
  
  var poidata = category.data
  //,threeConfig = options.threeConfig
  ,threeConfig = this.config
  ,scene = this.world.scene
  ,color = new THREE.Color( category.color || "#000" ) //0x00cc00
  ,floors = threeConfig.floors[ threeConfig.floorType ]
  ,pos_y0 = typeof floors.y !== 'undefined'? floors.y : floors.pos_y
  ;
  
  //console.log("addDataToMap: cat:color: ");console.log(cat);console.log(category.color);
  if( !this.data ) {
    this.data = {};
  }
  if( !this.data[cat] ) {
    this.data[cat] = [];
  }
  var distanceCutOff = options.distanceCutOff? parseInt(options.distanceCutOff) : 0;
  
  //---------------------------------------//
  //TBD:
  /*this.building.createBuildingGroup({
    poidata:poidata
    ,map:this.config.map
    ,distanceCutOff:distanceCutOff
    ,color:category.color //color
    ,cat:cat
    ,pos_y0:pos_y0
    ,categoryPopupTemplate:threeConfig.categories.nemoTemplate.explore.categoryPopup2
    ,config:threeConfig.uiwidget.aD.config
  });
  //return true;
  */
  //---------------------------------------//
  
  var mapPoiIconType = options.mapPoiIconType || 'icon'
  ,iconUrlOnLoad = threeConfig.iconUrlOnLoad
  ,markersModel = threeConfig.markersModel
  ,map = this.config.map
  ,goodBbox = map.goodBbox
  ,goodResTile = map.goodResTile
  ,grid = this.grid
  ,mapPoiIconUrl = (function() {
    var mapPoiIconUrl = '';  
    
    if( mapPoiIconType === 'icon' ) {
      mapPoiIconUrl = threeConfig.getImagePath( 'icon' )+'/'+ icon;
    }else if( mapPoiIconType === 'poiimg' ) {
      mapPoiIconUrl = threeConfig.getImagePath( 'poiimg' );
    }else if( mapPoiIconType === 'markers' ) {
      mapPoiIconUrl = threeConfig.getImagePath( 'markers' );
    }
    
    return mapPoiIconUrl;
  })()
  ,resolution = map.resolution
  ,center = threeConfig.explorationArea
  ,centerLonLat = center.geom.replace(/[^\s\d.]/g,'').split(/ /)
  ,XZ = map.lonLatToXZ( parseFloat( centerLonLat[0], 6 ), parseFloat( centerLonLat[1], 6 ) ) //explorationArea center
  ,pos_x0 = XZ.x
  ,pos_z0 = XZ.z
  ;
  
  //console.log("pos_x0,pos_y0,pos_z0:");
  //console.log(pos_x0);console.log(pos_y0);console.log(pos_z0);
  
  var objectScale = threeConfig.objectScale;
  var Sx = objectScale.Sx, Sy = objectScale.Sy, Sz = objectScale.Sz;
  
  for( var i=0; i<poidata.length; i++ ) {
    var poiImgSrc;
    if( !iconUrlOnLoad ) {
      poiImgSrc = mapPoiIconUrl + poidata[i].img;
    }else {
      if( mapPoiIconType === 'markers' ) {
        if( !poidata[i].markIcon ) break;
        poiImgSrc = mapPoiIconUrl + poidata[i].markIcon.mapUrl;
      }else{
        poiImgSrc = mapPoiIconUrl;
      }
    }
    
    var distance = parseInt(poidata[i].distanceUnformatted)
    if( distance >= distanceCutOff ) {
      continue;
    }
    
    var geom = poidata[i].geom
    ,lonlat = geom.replace(/[^\s\d.]/g,'').split(/ /)
    ,XZ = map.lonLatToXZ( parseFloat( lonlat[0] , 6), parseFloat( lonlat[1] , 6 ) )
    ,pos_x = XZ.x
    ,pos_z = XZ.z
    ,pos_y = pos_y0 + 2
    ,geometry = geometry? geometry : new THREE.PlaneGeometry(Sx,Sy)
    ,poiTexture, poiMaterial, poi;
    
    //TBD: icon to be present earlier itself
    if( icon ) {
      poidata[i].icon = icon; //poidata[i].markIcon.mapUrl;
    }
    
    if( !poidata[i].image ) {
      console.log("poidata[i].image:");console.log(poidata[i]);
    }
    if( materials ) {
      //TBD: poi configuration
      /*if( color ) {
        var __i=0,__l=materials.length;
        for( ; __i < __l; __i++ ) {
          materials[ __i ].color = color;
          //if( __i > 0 ) {
          //  materials[ __i ].map = threeConfig.getTexture({src:poiImgSrc});
          //}
        }
      }*/
      poiMaterial = new THREE.MeshFaceMaterial( materials );
      poi = new THREE.Mesh( geometry, poiMaterial );
    }else {
      //TBD: getTexture
      poiTexture = threeConfig.getTexture({src:poiImgSrc});
      //--- poi as basic geometry
      //poiMaterial = new THREE.MeshLambertMaterial({ color:color});
      //poiMaterial = new THREE.MeshPhongMaterial();
      /*poiMaterial = new THREE.MeshBasicMaterial({ color:color});
      poiMaterial.needsUpdate = true;
      poi = new THREE.Mesh( geometry, poiMaterial );
      poi.material.map = poiTexture;
      poi.material.map.needsUpdate = true;*/
      //--- poi as sprite
      //poiMaterial = new THREE.SpriteMaterial({ map:poiTexture, useScreenCoordinates:false });
      poiMaterial = new THREE.SpriteMaterial({ map:poiTexture });
      //poiMaterial.wrapS = poiMaterial.wrapT = THREE.RepeatWrapping;
      poi = new THREE.Sprite( poiMaterial );
      poi.scale.set( Sx, Sy, Sz ); //imageWidth,imageHeight
      pos_y = pos_y+(Sy/2);
    }
    
    poi.position.set( pos_x, pos_y, pos_z );
    //console.log("_callback: each:["+i+"]"); console.log("x->"+poi.position.x+" : z->"+poi.position.z);
    poi.userData = poidata[i];
    poi.userData.scale = { Sx:Sx ,Sy:Sy ,Sz:Sz };
    poi.userData.position = {x:pos_x, y:pos_y, z:pos_z};
    poi.name = cat;
    
    var start = { x:pos_x0, y:pos_y0, z:pos_z0 };
    //TBD: poi and line end position does not match properly
    //var end = { x:pos_x, y:pos_y0, z:pos_z };
    var end = { x:pos_x, y:pos_y, z:pos_z };
    
    var line = threeConfig.getCurvedLineFromSpline( start, end, color );
    line.name = cat;
    //poi.add(line); //TBD: why it doesn't work
    scene.add(line);
    
    //TBD: use poi.name or poi.userdata custom property to identify the items for tool tips
    threeConfig.menuObjects.push( poi );
    
    this.data[cat].push( poi );
    
    
    /*poi.traverse(function (object) {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });*/
    scene.add( poi );
    /*if( threeConfig.domEvents ) {
      threeConfig.domEvents.addEventListener( poi, 'mouseover', function(event){
        console.log('poi: mouseover'); console.log(event);
      }, false);
    }*/
  }
};
ThreeDPoi.prototype.onHover = function( event ) {
  event.preventDefault();

  var that = this;
  //2. create an array containing all objects in the scene with which the ray intersects
  var threeConfig = this.config
  ,world = this.world
  ,sceneObjects = threeConfig.menuObjects // this.scene.children; //TBD: ???
  ,intersects = world.ray.intersectObjects( sceneObjects )
  ,scene = world.scene
  ,eType = event.type
  ,el_dummyToolTip = $('#dummyToolTip')
  ,el_poiInfo = $('#nemo-poi3d-info')
  ,uiwidget = threeConfig.uiwidget
  ,categories = threeConfig.categories
  ,poi = null
  ,poiInfo = null
  ,categoryPopupTemplate = null
  ,catColor = "#a87c2c" //pretige theme color default
  ;
  
  if( eType == 'mousemove' && intersects.length && !$.isEmptyObject(intersects[0].object.userData) && intersects[0].object.visible ) {
    $("#"+world.viewerId).css({"cursor":"pointer"});
    //intersects[0].object.material 
    poi = intersects[0].object;
    //console.log("intersects: ");console.log(intersects);
    /*if( categories && categories[poi.userData.itemId] && !categories[poi.userData.itemId].selected ) {
      return false;
    }*/
    var canvasText = threeConfig.canvasText;
    if( !canvasText ) {
      canvasText = threeConfig.canvasText = new root.ThreeDWgt.CanvasText();
    }
    var textTexture = '';
    if(poi.userData.distance) {
      textTexture = canvasText.generateText(poi.userData.distance, canvasText.measureText("poi_distance_"+poi.userData.distance.toLowerCase()), "rgba(100,255,255,0.8)", 20);
    }
    
    if( categories ) {
      if( !categories.nemoTemplate.explore ) {
        categories.nemoTemplate.explore = vidteq.view._explore;
      }
      categoryPopupTemplate = categories.nemoTemplate.explore.categoryPopup2
      catColor = categories[poi.userData.itemId].color;
      poiInfo = categoryPopupTemplate(poi.userData, root.aD.config, catColor );
    }else {
      var imgUrl = root.cfg.cloneImageUrl.replace(/210/g, '200')+poi.userData.image;
      var city = ( root.cfg.city || '' ).charAt(0).toUpperCase()+root.cfg.city.slice(1);
      poiInfo = $('#vPopupFullScreenTemplate4').tmpl({
        data:poi.userData
        ,color:catColor
        ,img:imgUrl
        ,city:city
        ,font:"Trajan Pro"
      });
    }
    var poiDistanceInfo = '<span class="poi-distance positive">'+poi.userData.distance+'</span>';
    el_poiInfo.html(poiInfo);
    
    if( scene.getObjectByName('selectionCircle') ) {
      scene.remove( scene.getObjectByName('selectionCircle') );
    }
    
    var cline = threeConfig.getConcentricCircleLine({
      position: threeConfig.getPosition( poi, 0 ) //put the circle some units above the ground //{ x:clinePos.x, y:clinePos.y+2, z:clinePos.z } 
      ,orientation:'XZ'
      //,radius:100
      ,color:catColor
    });
    cline.name = 'selectionCircle';
    scene.add(cline);
    //scene.add(textTexture);
    
    if( !$('.tinytooltip').length ) {
      el_dummyToolTip.tinytooltip({
        classes:'nemo-poi3d-tooltip'
        ,message:poiDistanceInfo
        ,hover:false
        ,delay:1
      });
    }else {
      $('.tinytooltip').find(".message").html(poiDistanceInfo);
    }
    
    $(".tinytooltip.nemo-poi3d-tooltip .message").css({
      "background": "none repeat scroll 0 0 "+catColor
      ,"border":"2px solid "+catColor
    });
    el_dummyToolTip.trigger('showtooltip');
    //el_poiInfo.show();
    this.showHidePoiInterval( el_poiInfo ,'show');
    //console.log("toolTip debug point");
  }else {
    el_dummyToolTip.trigger('hidetooltip');
    //el_poiInfo.hide();
    this.showHidePoiInterval( el_poiInfo ,'hide');
    if( scene.getObjectByName('selectionCircle') ) {
      scene.remove( scene.getObjectByName('selectionCircle') );
    }
    $("#"+world.viewerId).css({"cursor":""});
  };

};
ThreeDPoi.prototype.showHidePoiInterval = function( el_poiInfo ,opt) {
  if(this.poiInterval) { clearTimeout(this.poiInterval); }
  if(opt == 'show') {
    el_poiInfo.show();    
  } else {
    this.poiInterval = setTimeout(function () {
      el_poiInfo.hide();    
    },5000);
  }
}
ThreeDPoi.prototype.hidePoi = function( options ) {
  options = options || {};
  var cat = options.cat
  ,threeConfig = this.config
  //,uiwidget = threeConfig.uiwidget
  //,categories = threeConfig.categories
  //,categoryObj = categories[cat]
  ,scene = this.world.scene
  ;
  
  for( var i= scene.children.length-1; i>=0; i-- ) { // remove from top
    var obj = scene.children[i];
    if( obj && obj.name == cat ) {
      //scene.remove( obj );
      obj.visible = false;
      /*if (obj.geometry) {
        obj.geometry.dispose();
        delete obj.geometry; // TBD why ?
      }
      if (obj.material) {
        if (obj.material.map && 
            obj.material.map.image && 
            obj.material.map.image.remove) {
          obj.material.map.image.remove();
        }
        if (obj.material.dispose) {
          obj.material.dispose();
        }
        delete obj.material;  // TBD why ?
      }
      //if (obj.dispose) {
      //  obj.dispose();
      //}
      obj.remove();
      delete obj; // TBD why?
      */
    }
  }
};

var Building = function( options ) {
  options = options || {}
  this.data = null;
  this.config = options;
  this.world = options.venue360; //TBD: if venue360 name is dropped, to be changed respectivey
};
Building.prototype.generateTexture = function( color ) {
  // build a small canvas 32x64 and paint it in white
  var canvas  = document.createElement( 'canvas' );
  canvas.width = 32;
  canvas.height    = 64;
  var context = canvas.getContext( '2d' );
  // plain it in white
  context.fillStyle    = color || '#ffffff';
  context.fillRect( 0, 0, 32, 64 );
  // draw the window rows - with a small noise to simulate light variations in each room
  for( var y = 2; y < 64; y += 2 ){
      for( var x = 0; x < 32; x += 2 ){
          var value   = Math.floor( Math.random() * 64 );
          context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
          context.fillRect( x, y, 2, 1 );
      }
  }

  // build a bigger canvas and copy the small one in it
  // This is a trick to upscale the texture without filtering
  var canvas2 = document.createElement( 'canvas' );
  canvas2.width    = 512;
  canvas2.height   = 1024;
  var context = canvas2.getContext( '2d' );
  // disable smoothing
  context.imageSmoothingEnabled        = false;
  context.webkitImageSmoothingEnabled  = false;
  context.mozImageSmoothingEnabled = false;
  // then draw the image
  context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
  // return the just built canvas2
  return canvas2;
};
Building.prototype.createBuildingGroup = function( options  ) {
  //Reference: http://learningthreejs.com/blog/2013/08/02/how-to-do-a-procedural-city-in-100lines/
  options = options || {};
  var threeConfig = this.config
  ,scene = this.world.scene
  ,map = options.map || this.config.map
  ,categoryPopupTemplate = options.categoryPopupTemplate
  ,poidata = options.poidata
  ,distanceCutOff = options.distanceCutOff
  ,color = options.color
  ,cat = options.cat
  ,pos_y0 = options.pos_y0
  ,numberOfBuildings = poidata.length || 20000
  ,buildingRotation   = { y:Math.random()*Math.PI*2 }
  /*,buildingPosition   = {
    x:Math.floor( Math.random() * 200 - 100 ) * 10
    ,z:Math.floor( Math.random() * 200 - 100 ) * 10
  }*/
  ;
  if( !this.data ) {
    this.data = {};
  }
  if( !this.data[cat] ) {
    this.data[cat] = [];
  }

  // build the base geometry for each building
  var geometry = new THREE.CubeGeometry( 1, 1, 1 );
  // translate the geometry to place the pivot point at the bottom instead of the center
  geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
  // get rid of the bottom face - it is never seen
  //geometry.faces.splice( 3, 1 );
  //geometry.faceVertexUvs[0].splice( 3, 1 );
  // change UVs for the top face
  // - it is the roof so it wont use the same texture as the side of the building
  // - set the UVs to the single coordinate 0,0. so the roof will be the same color
  //   as a floor row.
  geometry.faceVertexUvs[0][2][0].set( 0, 0 );
  geometry.faceVertexUvs[0][2][1].set( 0, 0 );
  geometry.faceVertexUvs[0][2][2].set( 0, 0 );
  //geometry.faceVertexUvs[0][2][3].set( 0, 0 );
  // buildMesh
  var buildingMesh= new THREE.Mesh( geometry );

  // base colors for vertexColors. light is for vertices at the top, shaddow is for the ones at the bottom
  var light = new THREE.Color( color || 0xffffff );
  var shadow = new THREE.Color( 0x303050 );

  var buildingGroupGeometry = new THREE.Geometry();
  for( var i = 0; i < numberOfBuildings; i ++ ) {
    var distance = parseInt(poidata[i].distanceUnformatted);
    if( distance >= distanceCutOff ) {
      continue;
    }
    
    var geom = poidata[i].geom
    ,lonlat = geom.replace(/[^\s\d.]/g,'').split(/ /)
    ,XZ = map.lonLatToXZ( parseFloat( lonlat[0] , 6), parseFloat( lonlat[1] , 6 ) )
    ,pos_x = XZ.x
    ,pos_z = XZ.z
    ,pos_y = pos_y0
    ;

    buildingMesh.position.x   = pos_x; //buildingPosition.x;
    buildingMesh.position.z   = pos_z; //buildingPosition.z;
    buildingMesh.position.y   = pos_y;
    
    /*buildingMesh.centroid = new THREE.Vector3();
    for (var i = 0, l = buildingMesh.geometry.vertices.length; i < l; i++) {
      buildingMesh.centroid.add(buildingMesh.geometry.vertices[i].clone());
    }
    buildingMesh.centroid.divideScalar(buildingMesh.geometry.vertices.length);
    var offset = buildingMesh.centroid.clone();
    buildingMesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offset.x, -offset.y, -offset.z));
    buildingMesh.position.copy(buildingMesh.centroid);*/
  
    // put a random rotation
    buildingMesh.rotation.y   = buildingRotation.y;
    // put a random scale
    buildingMesh.scale.x  = Math.random() * Math.random() * Math.random() * Math.random() * 10 + 10;
    buildingMesh.scale.y  = (Math.random() * Math.random() * Math.random() * buildingMesh.scale.x) * 8 + 8;
    buildingMesh.scale.z  = buildingMesh.scale.x

    // establish the base color for the buildingMesh
    var value   = 1 - Math.random() * Math.random();
    var baseColor   = new THREE.Color( color ); //new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );
    // set topColor/bottom vertexColors as adjustement of baseColor
    var topColor    = baseColor.clone().multiply( light );
    var bottomColor = baseColor.clone().multiply( shadow );
    // set .vertexColors for each face
    var geometry    = buildingMesh.geometry;       
    for( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {
      if( j === 2 ) {
          // set face.vertexColors on root face
          geometry.faces[ j ].vertexColors = [ baseColor, baseColor, baseColor, baseColor ];
      }else {
          // set face.vertexColors on sides faces
          geometry.faces[ j ].vertexColors = [ topColor, bottomColor, bottomColor, topColor ];
      }
    }
    
    // merge it with buildingGroupGeometry - very important for performance
    THREE.GeometryUtils.merge( buildingGroupGeometry, buildingMesh );
  }

  // generate the texture
  var texture       = new THREE.Texture( this.generateTexture( color ) );
  texture.anisotropy = this.world.renderer.getMaxAnisotropy();
  texture.needsUpdate    = true;

  // build the mesh
  var material  = new THREE.MeshLambertMaterial({
    map     : texture,
    vertexColors    : THREE.VertexColors
  });
  var buildingGroupMesh = new THREE.Mesh(buildingGroupGeometry, material );
  buildingGroupMesh.name = cat;
  buildingGroupMesh.position.y = -20;
  buildingGroupMesh.userData =  poidata;
  
  this.data[cat].push( buildingGroupMesh );
  //threeConfig.menuObjects.push( buildingGroupMesh );
  scene.add( buildingGroupMesh );
  
  var onRender = function( delta ) {
    if( buildingGroupMesh.position.y > 0 ) {
      buildingGroupMesh.userData.stopAnimation = true;
    }
    if( !buildingGroupMesh.userData.stopAnimation ) {
      console.log("__animate: delta:buildingGroupMesh: ");
      buildingGroupMesh.position.y = buildingGroupMesh.position.y+delta*1.5;
    }
  };
  threeConfig.onRender.push( { _call:this, onRender:onRender } );
  
  return buildingGroupMesh;
};

var Skyview  = function( options ) {
  options = options || {}
  this.data = null;
  this.options = options;
  this.menuObjects = [];
  this.world = options.world; //TBD: if venue360 name is dropped, to be changed respectivey
  this._init( options );
};
Skyview.prototype._init = function( options ) {
  var centerCube = options.centerCube
  ,geometry = options.geometry
  ,materials = options.materials
  ,pos_x = centerCube.position.x
  ,pos_y = centerCube.position.y > 0?
    ( 2.1*centerCube.geometry.boundingBox.center().y - centerCube.position.y ) :
    ( 2.1*centerCube.geometry.boundingBox.center().y + centerCube.position.y )
  ,pos_z = centerCube.position.z
  ,poiMaterial = new THREE.MeshFaceMaterial( materials )
  ,poi = new THREE.Mesh( geometry, poiMaterial )
  ;
  poi.position.set( pos_x, pos_y, pos_z );
  poi.name = "skyview";
  this.menuObjects.push( poi );
  this.world.scene.add( poi );
};
Skyview.prototype.onHover = function( event ) {
  event.preventDefault();
  var that = this;
  //2. create an array containing all objects in the scene with which the ray intersects
  var sceneObjects = this.menuObjects // this.scene.children; //TBD: ???
  ,intersects = this.world.ray.intersectObjects( sceneObjects )
  ,eType = event.type
  ,el_dummyToolTip = $('#dummyToolTip')
  ,poi = null
  ,bgColor = "#a87c2c" //pretige theme color default
  ;
  
  
  if( eType == 'mousemove' && intersects.length ) {
    $("#"+this.world.viewerId).css({"cursor":"pointer"});
  }else {
    $("#"+this.world.viewerId).css({"cursor":""});
  }
  /*if( eType == 'mousemove' && intersects.length ) {
    //intersects[0].object.material 
    poi = intersects[0].object;
    var toolTipInfo = '<span class="poi-distance positive"> Click to see Sky View</span>';    
    if( !$('.tinytooltip').length ) {
      el_dummyToolTip.tinytooltip({
        classes:'nemo-poi3d-tooltip'
        ,message:toolTipInfo
        ,hover:false
        ,delay:100
      });
    }else {
      $('.tinytooltip').find(".message").html(toolTipInfo);
    }
    el_dummyToolTip.trigger('showtooltip');
  }else {
    el_dummyToolTip.trigger('hidetooltip');
  };*/
};
Skyview.prototype.onClick = function( event ) {
  var eType = event.type;
  if( eType !== "mousedown" ) { return; }
  
  event.preventDefault();
  var that = this;
  //2. create an array containing all objects in the scene with which the ray intersects
  var sceneObjects = this.menuObjects // this.scene.children; //TBD: ???
  ,intersects = this.world.ray.intersectObjects( sceneObjects )
  ,el_dummyToolTip = $('#dummyToolTip')
  ,poi = null
  ,threeConfig = this.options
  ,uiwidget = threeConfig.uiwidget
  ;
  
  if( intersects.length ) {
    //intersects[0].object.material 
    poi = intersects[0].object;
    if( !poi.userData.active ) {
      poi.userData.active = true;
    }
    
    if( root.Degree360 ) {
      nemoUI = new root.Degree360({ uiwidget: uiwidget });
    }else {
      if( root.gui.createAndShowVenue ) {
        root.gui.createAndShowVenue( false,{
          isSkyView:true
          ,closeFs:function() {
            var centerCube = that.world.scene.getObjectByName('centerCube');
            threeConfig.threeConfig.projectPopupFTInvoke(centerCube);
            if( vidteq.gui.venue360UI.directFs ) {
              vidteq.gui.venue360UI.venue360.cleanUpTheScene();
              var popup2Id = vidteq.gui.venue360UI.getPopup2Id();
              $("#"+popup2Id).fadeOut("slow");
              $("#"+popup2Id).remove();
              var popupContact1Id = threeConfig.threeConfig.venue360.ui.getPopup2Id();
              $('#'+popupContact1Id).find('[id^=popupRotateF]').click();
              return;
            }
          }
        });
      }
    }
  };
};
var CanvasText  = function() {
  this.textTextures = {};
  this.maxWidth = 0;
  this.textSize = 120;
  this.textCanvas = null;
  this.tx = null;
  this.texturesNum = 0;
};
CanvasText.prototype.generateTextures  = function( options ) {
  options = options || {};
  for(var i = 0; i < planets.length; i++) {
      var w = this.measureText(tr("planet_"+planets[i].name.toLowerCase()));
      if(w > maxWidth) maxWidth = w;
  }
  for(var i = 0; i < satellites.length; i++)
  {
      var w = this.measureText(tr("satellite_"+satellites[i].name.toLowerCase()));
      if(w > maxWidth) maxWidth = w;
  }

  for(var i = 0; i < planets.length; i++)
      this.generateText(planets[i].name, tr("planet_"+planets[i].name.toLowerCase()), "rgba(255,255,255,0.8)", maxWidth);
  for(var i = 0; i < satellites.length; i++)
      this.generateText(satellites[i].name, tr("satellite_"+satellites[i].name.toLowerCase()), "rgba(100,255,255,0.8)", maxWidth);
};
CanvasText.prototype.measureText  = function(t) {
  var tx = this.tx;
  if( !this.textCanvas ) {
    //this.textCanvas = document.getElementById('textureCanvas');
    this.textCanvas = document.createElement('canvas');
    tx = this.tx = this.textCanvas.getContext('2d');
    //tx.font = "Bold 20px Arial";
    //tx.fillStyle = "rgba(0,0,0,0.95)";
  }
  this.setStyle(tx);
  return tx.measureText(t).width;
};
CanvasText.prototype.setStyle = function(tx, color) {
  tx = tx || this.tx;
  tx.textAlign = "left";
  tx.textBaseline = "middle";
  tx.font = "bold "+this.textSize+"px Arial";
  if(color) tx.fillStyle = color;
};
CanvasText.prototype.getPowerOfTwo = function(value) {
  var pow = 1;
  while(pow<value) pow *= 2;
  return pow;
};

CanvasText.prototype.generateText = function(label, text, color, width) {
  width = this.getPowerOfTwo(width);
  var textCanvas = this.textCanvas;
  var tx = this.tx;
  textCanvas.width = width;
  textCanvas.height = width; // kwadrat, mniejsze problemy ze skalowaniem

  this.setStyle(tx, color);
  tx.fillText(text, 50, width/2);

  tx.lineWidth = 5;
  tx.strokeStyle = "black"; // stroke color
  tx.strokeText(text, 50, width/2);

  var metrics = tx.measureText(text);
  var width = metrics.width;

  tx.moveTo(width+100, textCanvas.width/2+50); 
  tx.lineTo(3, textCanvas.width/2+50);
  tx.lineTo(3, textCanvas.height);
  tx.lineWidth = 5;
  tx.strokeStyle = "#eeeeee"; // line color
  tx.lineCap = "round";
  tx.stroke();
  tx.stroke();

  //var t = gl.createTexture();
  var t = new THREE.Texture(textCanvas) 
  t.needsUpdate = true;
  //t.image = textCanvas;
  this.texturesNum += 1;
  //handleLoadedTexture(t);
  this.textTextures[label] = t;
  return t;
};

ThreeDWgt.EffectController = EffectController;
ThreeDWgt.Skybox = Skybox;
ThreeDWgt.Util = Util;
ThreeDWgt.Size = Size;
ThreeDWgt.Pixel = Pixel;
ThreeDWgt.LonLat = LonLat;
ThreeDWgt.Bounds = Bounds;
ThreeDWgt.Tile = Tile;
ThreeDWgt.Grid = Grid;
ThreeDWgt.Map = Map;
ThreeDWgt.ThreeDPoi = ThreeDPoi;
ThreeDWgt.Building = Building;
ThreeDWgt.CanvasText = CanvasText;
ThreeDWgt.Skyview = Skyview;

ThreeDWgt.Shaders = Shaders;
ThreeDWgt.Tween = Tween;
ThreeDWgt.Particle = Particle;
ThreeDWgt.ParticleEngine = ParticleEngine;
ThreeDWgt.ParticleEffects = ParticleEffects;

root.ThreeDWgt = ThreeDWgt;

}(this, document, 'vidteq'));
