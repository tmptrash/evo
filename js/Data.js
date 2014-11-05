/**
 * This module is just a container for test data. It consist
 * of two parts: input data and output data. Main idea here is
 * to pass input data to organism and it should produce an
 * output data by echo command. The format of data is:
 *
 *     [[input numbers], [output numbers], ..]
 *
 * So all data in this array should be even. Every next data
 * set should be more complicated then previous. This is how
 * organism should develop itself.
 *
 * Dependencies
 *     Evo
 *
 * @author DeadbraiN
 */
//
// 00 = A  05 = F  10 = K  15 = P  20 = U  25 = Z
// 01 = B  06 = G  11 = L  16 = Q  21 = V
// 02 = C  07 = H  12 = M  17 = R  22 = W
// 03 = D  08 = I  13 = N  18 = S  23 = X
// 04 = E  09 = J  14 = O  19 = T  24 = Y
//
Evo.Data = [
    [0,0,0], [0], // xor
    [0,1,0], [1],
    [0,0,1], [1],
    [0,1,1], [0],
    [1,0,0], [0], // or
    [1,1,0], [1],
    [1,0,1], [1],
    [1,0,0], [0],
    [2,0,0], [0], // and
    [2,1,0], [0],
    [2,0,1], [0],
    [2,1,1], [1],
    [3,0],   [1], // not
    [3,1],   [0]  // not
//    [
//        1
//    ], [3,14,19],       // dot
//    [   1,1,1,
//        1,1,1,
//        1,1,1
//    ], [1,14,23],       // box
//    [   1,1,1,
//        1,0,1,
//        1,1,1
//    ], [2,8,17,2,11,4], // circle
];