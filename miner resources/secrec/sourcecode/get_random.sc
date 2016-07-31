/*
 * This file is a part of the EMTA KMD INF application on Sharemind framework.
 * Copyright (C) Cybernetica AS
 *
 * All rights are reserved. Reproduction in whole or part is prohibited
 * without the written consent of the copyright owner. The usage of this
 * code is subject to the appropriate license agreement.
 */

import shared3p;
import stdlib;
import shared3p_random;

domain pd_shared3p shared3p;

void main() {
    // Create "bytes" nr of random bytes and return them.
    // Example: Create 32 bytes (uint8 = 8 bit = 1 byte x 32) => uint8[[1]] rnd (32).

    uint32 bytes_cnt = argument("bytes");

    pd_shared3p uint8[[1]] rnd ((uint)bytes_cnt);

    rnd = randomize(rnd);

    publish("random", rnd);
}
