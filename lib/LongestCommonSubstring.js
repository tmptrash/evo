/**
 * Grabbed from http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Longest_common_substring#JavaScript
 * This function try to find the longest common substring in both string1 and string2.
 * For example: '123456', '345678' -> 4 (means '3456')
 */
function lcs(string1, string2) {
    // init max value
    var longestCommon = 0;
    // init 2D array with 0
    var table = [],
        len1 = string1.length,
        len2 = string2.length,
        row, col;
    for(row = 0; row <= len1; row++){
        table[row] = [];
        for(col = 0; col <= len2; col++){
            table[row][col] = 0;
        }
    }
    // fill table
    var i, j;
    for(i = 0; i < len1; i++){
        for(j = 0; j < len2; j++){
            if(string1[i] === string2[j]){
                if(table[i][j] === 0){
                    table[i+1][j+1] = 1;
                } else {
                    table[i+1][j+1] = table[i][j] + 1;
                }
                if(table[i+1][j+1] > longestCommon){
                    longestCommon = table[i+1][j+1];
                }
            } else {
                table[i+1][j+1] = 0;
            }
        }
    }
    return longestCommon;
}