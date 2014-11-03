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
Evo.Data = [
 // In      Out
//    [3,8,12,0], [8,17,0] // DIMA -> IRA


//    [1,2],      [3],
//    [1,2,3],    [6],
//    [1,2,3,4],  [10],
//    [2,3,4,5],  [14]


    [0], [0],
    [1], [1],
    [2], [2],
    [3], [3],
    [4], [4],
    [5], [5],
    [6], [6],
    [7], [7],
    [8], [8]


//    [0,0,0,0,0,0,0,0,0,0], [1,1,1,1,1,1,1,1,1,1]
//    [1,1,1,1,1,1,1,1,1,1], [0,0,0,0,0,0,0,0,0,0]


//    [2],   [2], // simple output
//    [3],   [3], // simple output
//
//    [0],   [1], // condition
//    [1],   [0], // condition
//
//    [1,1], [2], // plus
//    [1,1], [0], // minus
//    [2,3], [6], // multiply
//    [6,3], [2]  // divide
];