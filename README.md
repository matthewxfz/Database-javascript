# Database-javascript
This is the relational SQL database build with node.js

Part 1- Storage Manager
The goal of this assignment is to implement a simple storage manager - a module that is capable of reading blocks 
from a file on disk into memory and writing blocks from memory to a file on disk.

#Members:
1. Fangzhou Xiong	A20376382    <fxiong4@hawk.iit.edu>
2. Zhiquan  Li		A20381063	 <zli175@hawk.iit.edu>
3. Guangda  Li		A20360157    <gli32@hawk.iit.edu>


#Instruction of running program:
1. unpack the zip file to local
2. direct to the <rootworkpath>
3. run command: npm install mocha -g
4. To run the test case, run command: mocha

#dependency
./package.json

#layout
./src/DBErrors.js         command defined DBErrors
./src/File.js             file handle object
./src/StorageManager.js   storage manager 
./test/test_assign1_1.js  test cases

#API

1.  initStorageManager	Initialize the StorageManager.

2.  createPageFile		Create a file

3.  openPageFile		Open the file and store file information into file object.

4.  closePageFile		Close the file.

5.  destroyPageFile		Delete the file.

6.  readBlock			Read a block of data from file on disk into memory

7.  readFirstBlock		Read the first block from file on disk into memory

8.  readPreviousBlock	Read the previous block from file on disk into memory 

9. readCurrentBlock		Read the current block from file on disk into memory

10. readNextBlock		Read the next block from file on disk into memory

11. readLastBlock		Read the last block from file on disk into memory

12. writeBlock			Write a block from memory to the file 

13. writeCurrentBlock	Write a block from memory to the file of current position.

14. appendEmptyBlock	Write an empty block at the end of the file.

15. ensureCapacity		If the totalPageNumber is less than numberOfPages then add pages until it equals to the numberOfPages.
