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
  sm.types.base = sm.types.base || {};


  /****************
   * Public types *
   ****************/


  // The base types

  sm.types.base.Base = function(le) {
    this.typesize = this.constructor.typesize;
    this.typename = this.constructor.typename;

    this.le = (le === undefined || le === null ? true : le);
  };


  sm.types.base.TypedArrayBase = function(bits, val, le) {
    sm.types.base.Base.call(this, le);

    this.bits = bits;

    if ("number" == typeof val) {
      this.buffer = new Uint8Array(val * this.typesize).buffer;
      this.length = val;
      this.view = new DataView(this.buffer);
    } else if (val instanceof ArrayBuffer) {
      if (val.byteLength % this.typesize !== 0)
        throw new Error("Argument ArrayBuffer length must be a multiple of the typesize");

      // Reuse the given buffer
      this.buffer = val;
      this.length = this.buffer.byteLength / this.typesize;
      this.view = new DataView(this.buffer);
    } else if (val instanceof Array || val.buffer instanceof ArrayBuffer) {
      this.buffer = new Uint8Array(val.length * this.typesize).buffer;
      this.length = val.length;
      this.view = new DataView(this.buffer);

      // Copy the contents of the array
      for (var i = 0; i < val.length; ++i) {
        this.set(i, val[i]);
      }
    } else {
      throw new TypeError("Invalid argument value type");
    }
  }; sm.types.inherits(sm.types.base.TypedArrayBase, sm.types.base.Base);

  // TODO support the endianness flag in the toBytes function
  sm.types.base.TypedArrayBase.prototype.toBytes = function() {
    return new Uint8Array(this.buffer).valueOf();
  };

  sm.types.base.TypedArrayBase.prototype.toJsArray = function() {
    var arr = new Array(this.length);
    for (var i = 0; i < this.length; ++i)
      arr[i] = this.get(i);
    return arr;
  };


  sm.types.base.BigIntegerBase = function(bits, signed, val, le) {
    sm.types.base.TypedArrayBase.call(this, bits, val, le);
    this.signed = signed;
  }; sm.types.inherits(sm.types.base.BigIntegerBase, sm.types.base.TypedArrayBase);

  sm.types.base.BigIntegerBase.prototype.get = function(n) {
    var arr = new Uint8Array(this.buffer, n * this.typesize, this.typesize).valueOf();
    return sm.types.util.arrayToBigInteger(this.bits, this.signed, this.le, arr);
  };

  sm.types.base.BigIntegerBase.prototype.set = function(n, val) {
    var arr = sm.types.util.bigIntegerToArray(this.bits, this.signed, this.le, val);
    new Uint8Array(this.buffer, n * this.typesize, this.typesize).set(arr);
  };


  // public bool

  sm.types.base.BoolArray = function(val, le) {
    sm.types.base.TypedArrayBase.call(this, 8, val, le);
  }; sm.types.inherits(sm.types.base.BoolArray, sm.types.base.TypedArrayBase);

  sm.types.base.BoolArray.typesize = 1;
  sm.types.base.BoolArray.typename = "bool";

  sm.types.base.BoolArray.prototype.get = function(n) {
    return (this.view.getUint8(n * this.typesize) % 2) !== 0;
  };

  sm.types.base.BoolArray.prototype.set = function(n, val) {
    this.view.setUint8(n * this.typesize, (val % 2) !== 0);
  };


  // public int8

  sm.types.base.Int8Array = function(val, le) {
    sm.types.base.TypedArrayBase.call(this, 8, val, le);
  }; sm.types.inherits(sm.types.base.Int8Array, sm.types.base.TypedArrayBase);

  sm.types.base.Int8Array.typesize = 1;
  sm.types.base.Int8Array.typename = "int8";

  sm.types.base.Int8Array.prototype.get = function(n) {
    return this.view.getInt8(n * this.typesize);
  };

  sm.types.base.Int8Array.prototype.set = function(n, val) {
    this.view.setInt8(n * this.typesize, val);
  };


  // public int16

  sm.types.base.Int16Array = function(val, le) {
    sm.types.base.TypedArrayBase.call(this, 16, val, le);
  }; sm.types.inherits(sm.types.base.Int16Array, sm.types.base.TypedArrayBase);

  sm.types.base.Int16Array.typesize = 2;
  sm.types.base.Int16Array.typename = "int16";

  sm.types.base.Int16Array.prototype.get = function(n) {
    return this.view.getInt16(n * this.typesize, this.le);
  };

  sm.types.base.Int16Array.prototype.set = function(n, val) {
    this.view.setInt16(n * this.typesize, val, this.le);
  };


  // public int32

  sm.types.base.Int32Array = function(val, le) {
    sm.types.base.TypedArrayBase.call(this, 32, val, le);
  }; sm.types.inherits(sm.types.base.Int32Array, sm.types.base.TypedArrayBase);

  sm.types.base.Int32Array.typesize = 4;
  sm.types.base.Int32Array.typename = "int32";

  sm.types.base.Int32Array.prototype.get = function(n) {
    return this.view.getInt32(n * this.typesize, this.le);
  };

  sm.types.base.Int32Array.prototype.set = function(n, val) {
    this.view.setInt32(n * this.typesize, val, this.le);
  };


  // public int64

  sm.types.base.Int64Array = function(val, le) {
    sm.types.base.BigIntegerBase.call(this, 64, true, val, le);
  }; sm.types.inherits(sm.types.base.Int64Array, sm.types.base.BigIntegerBase);

  sm.types.base.Int64Array.typesize = 8;
  sm.types.base.Int64Array.typename = "int64";


  // public uint8

  sm.types.base.Uint8Array = function(val, le) {
    sm.types.base.TypedArrayBase.call(this, 8, val, le);
  }; sm.types.inherits(sm.types.base.Uint8Array, sm.types.base.TypedArrayBase);

  sm.types.base.Uint8Array.typesize = 1;
  sm.types.base.Uint8Array.typename = "uint8";

  sm.types.base.Uint8Array.prototype.get = function(n) {
    return this.view.getUint8(n * this.typesize);
  };

  sm.types.base.Uint8Array.prototype.set = function(n, val) {
    this.view.setUint8(n * this.typesize, val);
  };


  // public uint16

  sm.types.base.Uint16Array = function(val, le) {
    sm.types.base.TypedArrayBase.call(this, 16, val, le);
  }; sm.types.inherits(sm.types.base.Uint16Array, sm.types.base.TypedArrayBase);

  sm.types.base.Uint16Array.typesize = 2;
  sm.types.base.Uint16Array.typename = "uint16";

  sm.types.base.Uint16Array.prototype.get = function(n) {
    return this.view.getUint16(n * this.typesize, this.le);
  };

  sm.types.base.Uint16Array.prototype.set = function(n, val) {
    this.view.setUint16(n * this.typesize, val, this.le);
  };


  // public uint32

  sm.types.base.Uint32Array = function(val, le) {
    sm.types.base.TypedArrayBase.call(this, 32, val, le);
  }; sm.types.inherits(sm.types.base.Uint32Array, sm.types.base.TypedArrayBase);

  sm.types.base.Uint32Array.typesize = 4;
  sm.types.base.Uint32Array.typename = "uint32";

  sm.types.base.Uint32Array.prototype.get = function(n) {
    return this.view.getUint32(n * this.typesize, this.le);
  };

  sm.types.base.Uint32Array.prototype.set = function(n, val) {
    this.view.setUint32(n * this.typesize, val, this.le);
  };


  // public uint64

  sm.types.base.Uint64Array = function(val, le) {
    sm.types.base.BigIntegerBase.call(this, 64, false, val, le);
  }; sm.types.inherits(sm.types.base.Uint64Array, sm.types.base.BigIntegerBase);

  sm.types.base.Uint64Array.typesize = 8;
  sm.types.base.Uint64Array.typename = "uint64";


  // public float32

  sm.types.base.Float32Array = function(val, le) {
    sm.types.base.TypedArrayBase.call(this, 32, val, le);
  }; sm.types.inherits(sm.types.base.Float32Array, sm.types.base.TypedArrayBase);

  sm.types.base.Float32Array.typesize = 4;
  sm.types.base.Float32Array.typename = "float32";

  sm.types.base.Float32Array.prototype.get = function(n) {
    return this.view.getFloat32(n * this.typesize, this.le);
  };

  sm.types.base.Float32Array.prototype.set = function(n, val) {
    this.view.setFloat32(n * this.typesize, val, this.le);
  };


  // public float64

  sm.types.base.Float64Array = function(val, le) {
    sm.types.base.TypedArrayBase.call(this, 64, val, le);
  }; sm.types.inherits(sm.types.base.Float64Array, sm.types.base.TypedArrayBase);

  sm.types.base.Float64Array.typesize = 8;
  sm.types.base.Float64Array.typename = "float64";

  sm.types.base.Float64Array.prototype.get = function(n) {
    return this.view.getFloat64(n * this.typesize, this.le);
  };

  sm.types.base.Float64Array.prototype.set = function(n, val) {
    this.view.setFloat64(n * this.typesize, val, this.le);
  };


  /***************************
   * Protection domain types *
   ***************************/


  // The base types

  sm.types.base.PdBase = function(N, pubtype, le) {
    this.typesize = this.constructor.typesize;
    this.typename = this.constructor.typename;
    this.pdname = this.constructor.pdname;

    if (N < 1)
      throw new Error("Number of parties must be at least one");

    this.N = N;
    this.pubtype = pubtype;

    this.le = new Array(N);
    if (le === undefined || le === null) {
      for (var i = 0; i < this.le.length; ++i)
        this.le[i] = true;
    } else {
      if (!le instanceof Array)
        throw new TypeError("Array little endian flag expected");
      if (le.length != N)
        throw new Error("Array little endian flag length must equal the number of parties");
      for (var j = 0; j < le.length; ++j)
        this.le[j] = (le[j] === undefined || le[j] === null ? true : le[j]);
    }
  };

})(this.sm = this.sm === undefined ? {} : this.sm);
