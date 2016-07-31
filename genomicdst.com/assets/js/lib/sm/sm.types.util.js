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
  sm.types.util = sm.types.util || {};


  /********************
   * Helper functions *
   ********************/

  sm.types.util.arrayToBigInteger = function(bits, signed, le, arr) {
    var bi = le ? new BigInteger(sm.types.util.reverse(arr)) : new BigInteger(arr);
    return sm.types.util.bigIntegerMod(bits, signed, bi);
  };

  sm.types.util.bigIntegerToArray = function(bits, signed, le, bi) {
    var modN = BigInteger.ONE.shiftLeft(bits);
    var typesize = Math.ceil(bits / 8);

    // toByteArray() returns a big endian signed byte array
    var arr = bi.mod(modN).toByteArray().reverse();

    // Remove the extra sign byte, if it is there (inconsistent)
    if (arr.length > Math.ceil(bi.bitLength() / 8))
      arr.pop();

    // Add padding, if needed
    while (arr.length < typesize)
      arr.push(0);

    // Convert to unsigned byte array
    return le ? new Uint8Array(arr).valueOf() : new Uint8Array(arr.reverse()).valueOf();
  };

  sm.types.util.bigIntegerMod = function(bits, signed, bi) {
    var modN = BigInteger.ONE.shiftLeft(bits);
    bi = bi.mod(modN);
    return (signed && bi.compareTo(BigInteger.ONE.shiftLeft(bits - 1)) >= 0) ? bi.subtract(modN) : bi;
  };

  sm.types.util.reverse = function(arr) {
    if (arr instanceof Array) {
      return arr.reverse();
    } else {
      var array = new arr.constructor(arr);

      var left = null;
      var right = null;
      for (left = 0, right = array.length - 1; left < right; left += 1, right -= 1) {
        var temporary = array[left];
        array[left] = array[right];
        array[right] = temporary;
      }

      return array;
    }
  };

  sm.types.util.composeFloat32 = function(comp) {
    if (!comp instanceof Array)
      throw new TypeError("Array argument expected");
    if (comp.length != 3)
      throw new Error("Array argument of length 3 expected");

    var floatVal = new Float32Array(1);
    var bytes = new Uint8Array(floatVal.buffer);

    var sign = comp[0];
    var exp = comp[2] + 0x7f;

    var signif = new Uint32Array(1);
    signif[0] = comp[1];

    var signifBytes = new Uint8Array(signif.buffer);

    bytes[3] = (sign !== 0 ? 0x80 : 0x0) | (exp & 0xfe) >> 1;
    bytes[2] = (exp & 0x1) << 7 | (signifBytes[2] & 0x7f);
    bytes[1] = signifBytes[1];
    bytes[0] = signifBytes[0];

    return floatVal[0];
  };

  sm.types.util.decomposeFloat32 = function(val) {
    var floatVal = new Float32Array(1);
    var bytes = new Uint8Array(floatVal.buffer);

    floatVal[0] = val;

    var sign = bytes[3] >> 7;
    var exp = ((bytes[3] & 0x7f) << 1 | bytes[2] >> 7) - 0x7f;

    bytes[3] = 0;
    bytes[2] &= 0x7f;

    var signif = new Uint32Array(floatVal.buffer)[0];

    return new Array(sign, signif, exp);
  };

  sm.types.util.composeFloat64 = function(comp) {
    if (!comp instanceof Array)
      throw new TypeError("Array argument expected");
    if (comp.length != 3)
      throw new Error("Array argument of length 3 expected");
    if (!comp[1] instanceof BigInteger)
      throw new TypeError("The second argument must be a BigInteger");

    var bytes = new Uint8Array(Float64Array.BYTES_PER_ELEMENT);
    var floatVal = new DataView(bytes.buffer);

    var exp = comp[2] + 0x3ff;

    bytes.set(sm.types.util.bigIntegerToArray(64, false, false, comp[1]));

    bytes[0] = (comp[0] !== 0 ? 0x80 : 0x0) | (exp & 0x7f0) >> 4;
    bytes[1] = (exp & 0xf) << 4 | (bytes[1] & 0xf);

    return floatVal.getFloat64(0, false);
  };

  sm.types.util.decomposeFloat64 = function(val) {
    var bytes = new Uint8Array(Float64Array.BYTES_PER_ELEMENT);
    var floatVal = new DataView(bytes.buffer);

    floatVal.setFloat64(0, val, false);

    var sign = bytes[0] >> 7;
    var exp = ((bytes[0] & 0x7f) << 4 | bytes[1] >> 4) - 0x3ff;

    bytes[0] = 0;
    bytes[1] &= 0xf;

    var signif = sm.types.util.arrayToBigInteger(64, false, false, bytes);

    return new Array(sign, signif, exp);
  };

})(this.sm = this.sm === undefined ? {} : this.sm);
