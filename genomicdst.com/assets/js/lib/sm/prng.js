/*
 * This file is a part of the Sharemind framework.
 * Copyright (C) Cybernetica AS
 *
 * All rights are reserved. Reproduction in whole or part is prohibited
 * without the written consent of the copyright owner. The usage of this
 * code is subject to the appropriate license agreement.
 */

function PRNG (seed) {
  this.pool = [];
  this.rand_counter = 0; // Counts number of random butes asked
  this.ctr_counter = 0; // AES CTR counter

  if (seed.length != 32) {
    console.error('[prng] Seed must be exactly 32 bytes long.');
    return false;
  }

  this.key = seed.slice(0, 16);
  this.iv = seed.slice(16, 32);

  // Make AES key:
  AES_Init();
  AES_ExpandKey(this.key);

  this.refillPool();
}

PRNG.prototype.refillPool = function() {
  var block = this.iv.slice();

  // Apply counter:
  for (var k = 0; k < 16; k++) {
    // If k-th byte of counter is set,
    // apply this to the relevant part of IV:
    if ((this.ctr_counter >> (k*8)) > 0) {
      block[this.iv.length-1-k] ^= ((this.ctr_counter >> (k*8)) & 255);
    }
  }

  this.ctr_counter++;
  AES_Encrypt(block, this.key);
  this.pool = block;
  this.rand_counter = 0;
};

PRNG.prototype.nextWord = function() {
  // If there are not enough values in the pool, refill it:
  if (this.rand_counter + 4 > this.pool.length) {
    this.refillPool();
  }

  return (this.pool[this.rand_counter++] << 24) ^ (this.pool[this.rand_counter++] << 16)
     ^ (this.pool[this.rand_counter++] <<  8) ^  this.pool[this.rand_counter++];
};

PRNG.prototype.nextBytes = function(n) {
  var rand = [];

  while (rand.length < n) {
    if (this.rand_counter >= this.pool.length) {
      this.refillPool();
    }

    var bytes = this.pool.length - this.rand_counter < n - rand.length ?
      this.pool.length - this.rand_counter : n - rand.length;
    rand = rand.concat(this.pool.slice(this.rand_counter, this.rand_counter + bytes));
    this.rand_counter = this.rand_counter + bytes;
  }

  return rand;
};
