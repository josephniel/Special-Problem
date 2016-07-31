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


  /******************
   * Global objects *
   ******************/

  sm.types.prng = null;


  /********************
   * Helper functions *
   ********************/

  sm.types.inherits = function(child, parent) {
    var F = function() {};
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
  };

})(this.sm = this.sm === undefined ? {} : this.sm);
