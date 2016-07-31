/*
 * This file is a part of the Sharemind framework.
 * Copyright (C) Cybernetica AS
 *
 * All rights are reserved. Reproduction in whole or part is prohibited
 * without the written consent of the copyright owner. The usage of this
 * code is subject to the appropriate license agreement.
 */

(function(sm) {
  'use strict';

  /*************************
   * Namespace definitions *
   *************************/

  sm.types = sm.types || {};
  sm.types.shared3p = sm.types.shared3p || {};


  /********************
   * Helper functions *
   *********************/

  function additiveReconstruct(Atype, N, shares) {
    if (!shares instanceof Array)
      throw new TypeError("Array argument expected");

    if (shares.length != N)
      throw new Error("Shares array length must match the number of parties");

    var rVal = new Atype(1);
    for (var i = 0; i < N; ++i)
      rVal[0] += shares[i];

    return rVal[0];
  }

  function bigIntegerAdditiveReconstruct(N, bits, signed, shares) {
    if (!shares instanceof Array)
      throw new TypeError("Array argument expected");

    if (shares.length != N)
      throw new Error("Shares array length must match the number of parties");

    var rVal = BigInteger.ZERO;
    for (var i = 0; i < N; ++i) {
      if (!shares[i] instanceof BigInteger)
        throw new TypeError("BigInteger shares expected");
      rVal = rVal.add(shares[i]);
    }

    return sm.types.util.bigIntegerMod(bits, signed, rVal);
  }

  function additiveShare(prng, Atype, N, val) {
    var rVal = new Atype(N);
    new Uint8Array(rVal.buffer, Atype.BYTES_PER_ELEMENT).set(prng.nextBytes((N - 1) * Atype.BYTES_PER_ELEMENT));

    rVal[0] = val;
    for (var i = 1; i < N; ++i)
      rVal[0] -= rVal[i];

    return rVal.valueOf();
  }

  function bigIntegerAdditiveShare(prng, N, bits, signed, val) {
    if (!val instanceof BigInteger)
      throw new TypeError("BigInteger argument expected");

    var typesize = Math.ceil(bits) / 8;

    var rVal = new Array(N);
    rVal[0] = val.clone();

    var rnd = prng.nextBytes((N - 1) * typesize);

    for (var i = 1; i < N; ++i) {
      rVal[i] = sm.types.util.arrayToBigInteger(bits, signed, false, rnd.slice((i - 1) * typesize, i * typesize));
      rVal[0] = rVal[0].subtract(rVal[i]);
    }

    rVal[0] = sm.types.util.bigIntegerMod(bits, signed, rVal[0]);

    return rVal;
  }

  function xorReconstruct(Atype, N, shares) {
    if (!shares instanceof Array)
      throw new TypeError("Array argument expected");

    if (shares.length != N)
      throw new Error("Shares array length must match the number of parties");

    var rVal = new Atype(1);
    for (var i = 0; i < N; ++i)
      rVal[0] ^= shares[i];

    return rVal[0];
  }

  function bigIntegerXorReconstruct(N, bits, signed, shares) {
    if (!shares instanceof Array)
      throw new TypeError("Array argument expected");

    if (shares.length != N)
      throw new Error("Shares array length must match the number of parties");

    var rVal = BigInteger.ZERO;
    for (var i = 0; i < N; ++i) {
      if (!shares[i] instanceof BigInteger)
        throw new TypeError("BigInteger shares expected");
      rVal = rVal.xor(shares[i]);
    }

    return sm.types.util.bigIntegerMod(bits, signed, rVal);
  }

  function xorShare(prng, Atype, N, val) {
    var rVal = new Atype(N);
    new Uint8Array(rVal.buffer, Atype.BYTES_PER_ELEMENT).set(prng.nextBytes((N - 1) * Atype.BYTES_PER_ELEMENT));

    rVal[0] = val;
    for (var i = 1; i < N; ++i)
      rVal[0] ^= rVal[i];

    return rVal.valueOf();
  }

  function bigIntegerXorShare(prng, N, bits, signed, val) {
    if (!val instanceof BigInteger)
      throw new TypeError("BigInteger argument expected");

    var typesize = Math.ceil(bits) / 8;

    var rVal = new Array(N);
    rVal[0] = val.clone();

    var rnd = prng.nextBytes((N - 1) * typesize);

    for (var i = 1; i < N; ++i) {
      rVal[i] = sm.types.util.arrayToBigInteger(bits, signed, false, rnd.slice((i - 1) * typesize, i * typesize));
      rVal[0] = rVal[0].xor(rVal[i]);
    }

    rVal[0] = sm.types.util.bigIntegerMod(bits, signed, rVal[0]);

    return rVal;
  }


  /*************************
   * The additive3pp types *
   *************************/


  // The base types

  sm.types.shared3p.Base = function(pubtype, le) {
    sm.types.base.PdBase.call(this, 3, pubtype, le);
  }; sm.types.inherits(sm.types.shared3p.Base, sm.types.base.PdBase);

  sm.types.shared3p.Base.pdname = "pd_shared3p";

  sm.types.shared3p.Base.prototype.classify = function(val, prng) {
    this.constructor(val.length, this.le);

    for (var i = 0; i < val.length; ++i)
      this.set(i, this.share(val.get(i), prng));
  };

  sm.types.shared3p.Base.prototype.declassify = function(le) {
    var rVal = new this.pubtype(this.length, le);

    for (var i = 0; i < this.length; ++i)
      rVal.set(i, this.reconstruct(this.get(i)));

    return rVal;
  };


  sm.types.shared3p.TypedArrayBase = function(pubtype, val, le, prng) {
    sm.types.shared3p.Base.call(this, pubtype, le);

    if (val instanceof this.pubtype) {
      prng = (prng === undefined || prng === null ? sm.types.prng : prng);
      if (prng === undefined || prng === null)
        throw new Error("No random number generator specified. Please set the 'sm.types.prng' variable or supply one in the constructor.");

      this.classify(val, prng);
    } else {
      if ("number" == typeof val) {
        this.buffer = new Array(this.N);

        for (var i = 0; i < this.N; ++i)
          this.buffer[i] = new Uint8Array(val * this.typesize).buffer;

        this.length = val;
      } else if (val instanceof Array) {
        if (val.length != this.N)
          throw new Error("Argument array length must be equal to the number of parties");

        this.buffer = new Array(this.N);

        var bytelength = 0;
        if (val[0] instanceof ArrayBuffer) {
          bytelength = val[0].byteLength;
        } else {
          throw new TypeError("Argument array must contain buffers for each party");
        }

        for (var j = 0; j < val.length; ++j) {
          if (val[j] instanceof ArrayBuffer) {
            if (val[j].byteLength != bytelength)
              throw new Error("Argument array must contain buffers of equal size");
            if (val[j].byteLength % this.typesize !== 0)
              throw new Error("Argument array buffer length must be a multiple of the typesize");

            // Reuse the given buffer
            this.buffer[j] = val[j];
          } else {
            throw new TypeError("Argument array must contain buffers for each party");
          }
        }

        this.length = this.buffer[0].byteLength / this.typesize;
      } else {
        throw new TypeError("Invalid argument value type");
      }

      this.view = new Array(this.N);

      for (var k = 0; k < this.N; ++k)
        this.view[k] = new DataView(this.buffer[k]);
    }
  }; sm.types.inherits(sm.types.shared3p.TypedArrayBase, sm.types.shared3p.Base);

  sm.types.shared3p.TypedArrayBase.prototype.get = function(n) {
    var arr = new Array(this.N);
    for (var i = 0; i < this.N; ++i)
      arr[i] = this.getValue(i, n);
    return arr;
  };

  sm.types.shared3p.TypedArrayBase.prototype.set = function(n, shares) {
    if (!shares instanceof Array)
      throw new TypeError("Array argument expected");
    if (shares.length != this.N)
      throw new Error("Shares array length must match the number of parties");

    for (var i = 0; i < shares.length; ++i)
      this.setValue(i, n, shares[i]);
  };

  // TODO support the endianness flag in the toBytes function
  sm.types.shared3p.TypedArrayBase.prototype.toBytes = function(i) {
    if (i === undefined || i === null) {
      var rVal = new Array(this.N);
      for (var j = 0; j < this.N; ++j)
        rVal[j] = new Uint8Array(this.buffer[j]).valueOf();

      return rVal;
    } else {
      if (i < 0 || i >= this.N)
        throw new RangeError("Argument value out of range");

      return new Uint8Array(this.buffer[i]).valueOf();
    }
  };


  sm.types.shared3p.BigIntegerBase = function(pubtype, bits, signed, val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, pubtype, val, le, prng);
    this.bits = bits;
    this.signed = signed;
  }; sm.types.inherits(sm.types.shared3p.BigIntegerBase, sm.types.shared3p.TypedArrayBase);


  sm.types.shared3p.FloatBase = function(pubtype, bias, signbits, signifbits, expbits, val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, pubtype, val, le, prng);

    this.bias = bias;

    this.signbits = signbits;
    this.signifbits = signifbits;
    this.expbits = expbits;

    this.signsize = Math.ceil(signbits / 8);
    this.signifsize = Math.ceil(signifbits / 8);
    this.expsize = Math.ceil(expbits / 8);

    // Assuming the fields are byte aligned
    this.signoff = 0;
    this.signifoff = this.signoff + this.signsize;
    this.expoff = this.signifoff + this.signifsize;
  }; sm.types.inherits(sm.types.shared3p.FloatBase, sm.types.shared3p.TypedArrayBase);


  // additive3pp bool

  sm.types.shared3p.BoolArray = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.BoolArray, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.BoolArray, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.BoolArray.typesize = 1;
  sm.types.shared3p.BoolArray.typename = "bool";
  sm.types.shared3p.BoolArray.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.BoolArray.prototype.getValue = function(i, n) {
    return (this.view[i].getUint8(n * this.typesize) % 2) !== 0;
  };

  sm.types.shared3p.BoolArray.prototype.setValue = function(i, n, val) {
    this.view[i].setUint8(n * this.typesize, (val % 2) !== 0);
  };

  sm.types.shared3p.BoolArray.prototype.reconstruct = function(shares) {
    return xorReconstruct(Uint8Array, this.N, shares);
  };

  sm.types.shared3p.BoolArray.prototype.share = function(val, prng) {
    return xorShare(prng, Uint8Array, this.N, val);
  };


  // additive3pp int8

  sm.types.shared3p.Int8Array = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.Int8Array, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Int8Array, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.Int8Array.typesize = 1;
  sm.types.shared3p.Int8Array.typename = "int8";
  sm.types.shared3p.Int8Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Int8Array.prototype.getValue = function(i, n) {
    return this.view[i].getInt8(n * this.typesize);
  };

  sm.types.shared3p.Int8Array.prototype.setValue = function(i, n, val) {
    this.view[i].setInt8(n * this.typesize, val);
  };

  sm.types.shared3p.Int8Array.prototype.reconstruct = function(shares) {
    return additiveReconstruct(Int8Array, this.N, shares);
  };

  sm.types.shared3p.Int8Array.prototype.share = function(val, prng) {
    return additiveShare(prng, Int8Array, this.N, val);
  };


  // additive3pp int16

  sm.types.shared3p.Int16Array = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.Int16Array, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Int16Array, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.Int16Array.typesize = 2;
  sm.types.shared3p.Int16Array.typename = "int16";
  sm.types.shared3p.Int16Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Int16Array.prototype.getValue = function(i, n) {
    return this.view[i].getInt16(n * this.typesize, this.le[i]);
  };

  sm.types.shared3p.Int16Array.prototype.setValue = function(i, n, val) {
    this.view[i].setInt16(n * this.typesize, val, this.le[i]);
  };

  sm.types.shared3p.Int16Array.prototype.reconstruct = function(shares) {
    return additiveReconstruct(Int16Array, this.N, shares);
  };

  sm.types.shared3p.Int16Array.prototype.share = function(val, prng) {
    return additiveShare(prng, Int16Array, this.N, val);
  };


  // additive3pp int32

  sm.types.shared3p.Int32Array = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.Int32Array, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Int32Array, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.Int32Array.typesize = 4;
  sm.types.shared3p.Int32Array.typename = "int32";
  sm.types.shared3p.Int32Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Int32Array.prototype.getValue = function(i, n) {
    return this.view[i].getInt32(n * this.typesize, this.le[i]);
  };

  sm.types.shared3p.Int32Array.prototype.setValue = function(i, n, val) {
    this.view[i].setInt32(n * this.typesize, val, this.le[i]);
  };

  sm.types.shared3p.Int32Array.prototype.reconstruct = function(shares) {
    return additiveReconstruct(Int32Array, this.N, shares);
  };

  sm.types.shared3p.Int32Array.prototype.share = function(val, prng) {
    return additiveShare(prng, Int32Array, this.N, val);
  };


  // additive3pp int64

  sm.types.shared3p.Int64Array = function(val, le, prng) {
    sm.types.shared3p.BigIntegerBase.call(this, sm.types.base.Int64Array, 64, true, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Int64Array, sm.types.shared3p.BigIntegerBase);

  sm.types.shared3p.Int64Array.typesize = 8;
  sm.types.shared3p.Int64Array.typename = "int64";
  sm.types.shared3p.Int64Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Int64Array.prototype.getValue = function(i, n) {
    var signifarr = new Uint8Array(this.buffer[i], n * this.typesize, this.typesize).valueOf();
    return sm.types.util.arrayToBigInteger(this.bits, this.signed, this.le[i], signifarr);
  };

  sm.types.shared3p.Int64Array.prototype.setValue = function(i, n, val) {
    var signifarr = sm.types.util.bigIntegerToArray(this.bits, this.signed, this.le[i], val);
    new Uint8Array(this.buffer[i], n * this.typesize, this.typesize).set(signifarr);
  };

  sm.types.shared3p.Int64Array.prototype.reconstruct = function(shares) {
    return bigIntegerAdditiveReconstruct(this.N, this.bits, this.signed, shares);
  };

  sm.types.shared3p.Int64Array.prototype.share = function(val, prng) {
    return bigIntegerAdditiveShare(prng, this.N, this.bits, this.signed, val);
  };


  // additive3pp uint8

  sm.types.shared3p.Uint8Array = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.Uint8Array, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Uint8Array, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.Uint8Array.typesize = 1;
  sm.types.shared3p.Uint8Array.typename = "uint8";
  sm.types.shared3p.Uint8Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Uint8Array.prototype.getValue = function(i, n) {
    return this.view[i].getUint8(n * this.typesize);
  };

  sm.types.shared3p.Uint8Array.prototype.setValue = function(i, n, val) {
    this.view[i].setUint8(n * this.typesize, val);
  };

  sm.types.shared3p.Uint8Array.prototype.reconstruct = function(shares) {
    return additiveReconstruct(Uint8Array, this.N, shares);
  };

  sm.types.shared3p.Uint8Array.prototype.share = function(val, prng) {
    return additiveShare(prng, Uint8Array, this.N, val);
  };


  // additive3pp uint16

  sm.types.shared3p.Uint16Array = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.Uint16Array, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Uint16Array, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.Uint16Array.typesize = 2;
  sm.types.shared3p.Uint16Array.typename = "uint16";
  sm.types.shared3p.Uint16Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Uint16Array.prototype.getValue = function(i, n) {
    return this.view[i].getUint16(n * this.typesize, this.le[i]);
  };

  sm.types.shared3p.Uint16Array.prototype.setValue = function(i, n, val) {
    this.view[i].setUint16(n * this.typesize, val, this.le[i]);
  };

  sm.types.shared3p.Uint16Array.prototype.reconstruct = function(shares) {
    return additiveReconstruct(Uint16Array, this.N, shares);
  };

  sm.types.shared3p.Uint16Array.prototype.share = function(val, prng) {
    return additiveShare(prng, Uint16Array, this.N, val);
  };


  // additive3pp uin32

  sm.types.shared3p.Uint32Array = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.Uint32Array, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Uint32Array, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.Uint32Array.typesize = 4;
  sm.types.shared3p.Uint32Array.typename = "uint32";
  sm.types.shared3p.Uint32Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Uint32Array.prototype.getValue = function(i, n) {
    return this.view[i].getUint32(n * this.typesize, this.le[i]);
  };

  sm.types.shared3p.Uint32Array.prototype.setValue = function(i, n, val) {
    this.view[i].setUint32(n * this.typesize, val, this.le[i]);
  };

  sm.types.shared3p.Uint32Array.prototype.reconstruct = function(shares) {
    return additiveReconstruct(Uint32Array, this.N, shares);
  };

  sm.types.shared3p.Uint32Array.prototype.share = function(val, prng) {
    return additiveShare(prng, Uint32Array, this.N, val);
  };


  // additive3pp uint64

  sm.types.shared3p.Uint64Array = function(val, le, prng) {
    sm.types.shared3p.BigIntegerBase.call(this, sm.types.base.Uint64Array, 64, false, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Uint64Array, sm.types.shared3p.BigIntegerBase);

  sm.types.shared3p.Uint64Array.typesize = 8;
  sm.types.shared3p.Uint64Array.typename = "uint64";
  sm.types.shared3p.Uint64Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Uint64Array.prototype.getValue = function(i, n) {
    var signifarr = new Uint8Array(this.buffer[i], n * this.typesize, this.typesize).valueOf();
    return sm.types.util.arrayToBigInteger(this.bits, this.signed, this.le[i], signifarr);
  };

  sm.types.shared3p.Uint64Array.prototype.setValue = function(i, n, val) {
    var signifarr = sm.types.util.bigIntegerToArray(this.bits, this.signed, this.le[i], val);
    new Uint8Array(this.buffer[i], n * this.typesize, this.typesize).set(signifarr);
  };

  sm.types.shared3p.Uint64Array.prototype.reconstruct = function(shares) {
    return bigIntegerAdditiveReconstruct(this.N, this.bits, this.signed, shares);
  };

  sm.types.shared3p.Uint64Array.prototype.share = function(val, prng) {
    return bigIntegerAdditiveShare(prng, this.N, this.bits, this.signed, val);
  };


  // additive3pp float32

  sm.types.shared3p.Float32Array = function(val, le, prng) {
    // float32: 8-bit sign | 32-bit significand | 16-bit exponent
    sm.types.shared3p.FloatBase.call(this, sm.types.base.Float32Array, Math.pow(2, 14) - 1, 8, 32, 16, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Float32Array, sm.types.shared3p.FloatBase);

  sm.types.shared3p.Float32Array.typesize = 7;
  sm.types.shared3p.Float32Array.typename = "float32";
  sm.types.shared3p.Float32Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Float32Array.prototype.getValue = function(i, n) {
    var offset = n * this.typesize;
    return [this.view[i].getUint8(offset + this.signoff),
      this.view[i].getUint32(offset + this.signifoff, this.le[i]),
      this.view[i].getUint16(offset + this.expoff, this.le[i])];
  };

  sm.types.shared3p.Float32Array.prototype.setValue = function(i, n, val) {
    if (!val instanceof Array)
      throw new TypeError("Array argument expected");

    if (val.length != 3)
      throw new Error("Array argument must contain three float components");

    var offset = n * this.typesize;

    this.view[i].setUint8(offset + this.signoff, val[0]);
    this.view[i].setUint32(offset + this.signifoff, val[1], this.le[i]);
    this.view[i].setUint16(offset + this.expoff, val[2], this.le[i]);
  };

  sm.types.shared3p.Float32Array.prototype.reconstruct = function(shares) {
    if (!shares instanceof Array)
      throw new TypeError("Array argument expected");

    if (shares.length != this.N)
      throw new Error("Shares array length must match the number of parties");

    for (var i = 0; i < this.N; ++i) {
      if (!shares[i] instanceof Array)
        throw new TypeError("Array shares expected");
      if (shares[i].length != 3)
        throw new Error("Array shares must contain three float components");
    }

    // Reconstruct exponent
    var expshares = [];
    for (var j = 0; j < this.N; ++j)
      expshares.push(shares[j][2]);

    var exp = additiveReconstruct(Uint16Array, this.N, expshares);
    // Because the private float representation is denormalized and the
    // IEEE-754 float is not, we have to adjust the exponent.
    exp -= this.bias + 1;

    if (exp + 0x7f < 0x0) {
      return -Infinity;
    } else if (exp + 0x7f > 0xff) {
      return Infinity;
    } else {
      // Reconstruct sign
      var signshares = [];
      for (var k = 0; k < this.N; ++k)
        signshares.push(shares[k][0]);

      var sign = additiveReconstruct(Uint8Array, this.N, signshares);
      sign = sign & 0x1 ? 0 : 1;

      // Reconstruct significand
      var signifshares = [];
      for (var l = 0; l < this.N; ++l)
        signifshares.push(shares[l][1]);

      var signif = additiveReconstruct(Uint32Array, this.N, signifshares);
      signif = (signif << 1) >> 9;

      // Put it all together
      return sm.types.util.composeFloat32(new Array(sign, signif, exp));
    }
  };

  sm.types.shared3p.Float32Array.prototype.share = function(val, prng) {
    var comp = sm.types.util.decomposeFloat32(val);

    var sign = comp[0] & 0x1 ? 0 : 1;
    var signif = comp[1] << 8;
    // Because the private float representation is denormalized and the
    // IEEE-754 float is not, we have to adjust the exponent.
    var exp = comp[2] + this.bias + 1;

    if (exp !== 0 || signif !== 0)
      signif |= 0x80000000;

    var signshares = additiveShare(prng, Uint8Array, this.N, sign);
    var signifshares = additiveShare(prng, Uint32Array, this.N, signif);
    var expshares = additiveShare(prng, Uint16Array, this.N, exp);

    var rVal = new Array(this.N);
    for (var i = 0; i < this.N; ++i)
      rVal[i] = new Array(signshares[i], signifshares[i], expshares[i]);

    return rVal;
  };


  // additive3pp float64

  sm.types.shared3p.Float64Array = function(val, le, prng) {
    // float64: 8-bit sign | 64-bit significand | 16-bit exponent
    sm.types.shared3p.FloatBase.call(this, sm.types.base.Float64Array, Math.pow(2, 14) - 1, 8, 64, 16, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.Float64Array, sm.types.shared3p.FloatBase);

  sm.types.shared3p.Float64Array.typesize = 11;
  sm.types.shared3p.Float64Array.typename = "float64";
  sm.types.shared3p.Float64Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.Float64Array.prototype.getValue = function(i, n) {
    var offset = n * this.typesize;

    var signifarr = new Uint8Array(this.buffer[i], offset + this.signifoff, this.signifsize).valueOf();

    return [this.view[i].getUint8(offset + this.signoff),
      sm.types.util.arrayToBigInteger(this.signifbits, false, this.le[i], signifarr),
      this.view[i].getUint16(offset + this.expoff, this.le[i])];
  };

  sm.types.shared3p.Float64Array.prototype.setValue = function(i, n, val) {
    if (!val instanceof Array)
      throw new TypeError("Array argument expected");

    if (val.length != 3)
      throw new Error("Array argument must contain three float components");

    if (!val[1] instanceof BigInteger)
      throw new Error("BigInteger second float component expected");

    var offset = n * this.typesize;

    var signifarr = sm.types.util.bigIntegerToArray(64, false, this.le[i], val[1]);
    new Uint8Array(this.buffer[i], offset + this.signifoff, this.signifsize).set(signifarr);

    this.view[i].setUint8(offset + this.signoff, val[0], this.le[i]);
    this.view[i].setUint16(offset + this.expoff, val[2], this.le[i]);
  };

  sm.types.shared3p.Float64Array.prototype.reconstruct = function(shares) {
    if (!shares instanceof Array)
      throw new TypeError("Array argument expected");

    if (shares.length != this.N)
      throw new Error("Shares array length must match the number of parties");

    for (var i = 0; i < this.N; ++i) {
      if (!shares[i] instanceof Array)
        throw new TypeError("Array shares expected");
      if (shares[i].length != 3)
        throw new Error("Array shares must contain three float components");
    }

    // Reconstruct exponent
    var expshares = [];
    for (var j = 0; j < this.N; ++j)
      expshares.push(shares[j][2]);

    var exp = additiveReconstruct(Uint16Array, this.N, expshares);
    // Because the private float representation is denormalized and the
    // IEEE-754 float is not, we have to adjust the exponent.
    exp -= this.bias + 1;

    if (exp + 0x3ff < 0x0) {
      return -Infinity;
    } else if (exp + 0x3ff > 0x7ff) {
      return Infinity;
    } else {
      // Reconstruct sign
      var signshares = [];
      for (var k = 0; k < this.N; ++k)
        signshares.push(shares[k][0]);

      var sign = additiveReconstruct(Uint8Array, this.N, signshares);
      sign = sign & 0x1 ? 0 : 1;

      // Reconstruct significand
      var signifshares = [];
      for (var l = 0; l < this.N; ++l)
        signifshares.push(shares[l][1]);

      var signif = bigIntegerAdditiveReconstruct(this.N, this.signifbits, false, signifshares);
      // Set the highest bit to zero, and then shift
      signif.clearBit(this.signifbits - 1);
      signif = signif.shiftRight(11);

      // Put it all together
      return sm.types.util.composeFloat64(new Array(sign, signif, exp));
    }
  };

  sm.types.shared3p.Float64Array.prototype.share = function(val, prng) {
    var comp = sm.types.util.decomposeFloat64(val);

    var sign = comp[0] & 0x1 ? 0 : 1;
    var signif = comp[1].shiftLeft(11);
    // Because the private float representation is denormalized and the
    // IEEE-754 float is not, we have to adjust the exponent.
    var exp = comp[2] + this.bias + 1;

    if (exp !== 0 || signif.compareTo(BigInteger.ZERO) !== 0)
      signif = signif.setBit(this.signifbits - 1);

    var signshares = additiveShare(prng, Uint8Array, this.N, sign);
    var signifshares = bigIntegerAdditiveShare(prng, this.N, this.signifbits, false, signif);
    var expshares = additiveShare(prng, Uint16Array, this.N, exp);

    var rVal = new Array(this.N);
    for (var i = 0; i < this.N; ++i)
      rVal[i] = new Array(signshares[i], signifshares[i], expshares[i]);

    return rVal;
  };


  // additive3pp xor_uint8

  sm.types.shared3p.XorUint8Array = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.Uint8Array, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.XorUint8Array, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.XorUint8Array.typesize = 1;
  sm.types.shared3p.XorUint8Array.typename = "xor_uint8";
  sm.types.shared3p.XorUint8Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.XorUint8Array.prototype.getValue = function(i, n) {
    return this.view[i].getUint8(n * this.typesize);
  };

  sm.types.shared3p.XorUint8Array.prototype.setValue = function(i, n, val) {
    this.view[i].setUint8(n * this.typesize, val);
  };

  sm.types.shared3p.XorUint8Array.prototype.reconstruct = function(shares) {
    return xorReconstruct(Uint8Array, this.N, shares);
  };

  sm.types.shared3p.XorUint8Array.prototype.share = function(val, prng) {
    return xorShare(prng, Uint8Array, this.N, val);
  };


  // additive3pp xor_uint16

  sm.types.shared3p.XorUint16Array = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.Uint16Array, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.XorUint16Array, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.XorUint16Array.typesize = 2;
  sm.types.shared3p.XorUint16Array.typename = "xor_uint16";
  sm.types.shared3p.XorUint16Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.XorUint16Array.prototype.getValue = function(i, n) {
    return this.view[i].getUint16(n * this.typesize, this.le[i]);
  };

  sm.types.shared3p.XorUint16Array.prototype.setValue = function(i, n, val) {
    this.view[i].setUint16(n * this.typesize, val, this.le[i]);
  };

  sm.types.shared3p.XorUint16Array.prototype.reconstruct = function(shares) {
    return xorReconstruct(Uint16Array, this.N, shares);
  };

  sm.types.shared3p.XorUint16Array.prototype.share = function(val, prng) {
    return xorShare(prng, Uint16Array, this.N, val);
  };


  // additive3pp xor_uint32

  sm.types.shared3p.XorUint32Array = function(val, le, prng) {
    sm.types.shared3p.TypedArrayBase.call(this, sm.types.base.Uint32Array, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.XorUint32Array, sm.types.shared3p.TypedArrayBase);

  sm.types.shared3p.XorUint32Array.typesize = 4;
  sm.types.shared3p.XorUint32Array.typename = "xor_uint32";
  sm.types.shared3p.XorUint32Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.XorUint32Array.prototype.getValue = function(i, n) {
    return this.view[i].getUint32(n * this.typesize, this.le[i]);
  };

  sm.types.shared3p.XorUint32Array.prototype.setValue = function(i, n, val) {
    this.view[i].setUint32(n * this.typesize, val, this.le[i]);
  };

  sm.types.shared3p.XorUint32Array.prototype.reconstruct = function(shares) {
    return xorReconstruct(Uint32Array, this.N, shares);
  };

  sm.types.shared3p.XorUint32Array.prototype.share = function(val, prng) {
    return xorShare(prng, Uint32Array, this.N, val);
  };


  // additive3pp xor_uint64

  sm.types.shared3p.XorUint64Array = function(val, le, prng) {
    sm.types.shared3p.BigIntegerBase.call(this, sm.types.base.Uint64Array, 64, false, val, le, prng);
  }; sm.types.inherits(sm.types.shared3p.XorUint64Array, sm.types.shared3p.BigIntegerBase);

  sm.types.shared3p.XorUint64Array.typesize = 8;
  sm.types.shared3p.XorUint64Array.typename = "xor_uint64";
  sm.types.shared3p.XorUint64Array.pdname = sm.types.shared3p.Base.pdname;

  sm.types.shared3p.XorUint64Array.prototype.getValue = function(i, n) {
    var signifarr = new Uint8Array(this.buffer[i], n * this.typesize, this.typesize).valueOf();
    return sm.types.util.arrayToBigInteger(this.bits, this.signed, this.le[i], signifarr);
  };

  sm.types.shared3p.XorUint64Array.prototype.setValue = function(i, n, val) {
    var signifarr = sm.types.util.bigIntegerToArray(this.bits, this.signed, this.le[i], val);
    new Uint8Array(this.buffer[i], n * this.typesize, this.typesize).set(signifarr);
  };

  sm.types.shared3p.XorUint64Array.prototype.reconstruct = function(shares) {
    return bigIntegerXorReconstruct(this.N, this.bits, this.signed, shares);
  };

  sm.types.shared3p.XorUint64Array.prototype.share = function(val, prng) {
    return bigIntegerXorShare(prng, this.N, this.bits, this.signed, val);
  };

})(this.sm = this.sm === undefined ? {} : this.sm);
