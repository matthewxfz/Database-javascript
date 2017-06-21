# Database-javascript
This is the relational SQL database build with node.js

Part 1- Storage Manager
The goal of this assignment is to implement a simple storage manager - a module that is capable of reading blocks 
from a file on disk into memory and writing blocks from memory to a file on disk.

Part 2- Buffer Manager
The goal of this assignment is to implement a buffer manager which manages a fixed number of pages in memory that represent pages from a page file managed by the storage manager.The Buffer manager should be able to handle more than one open buffer pool at the same time or one open buffer pool for each page file. FIFO and LRU replacement strategy implementations are required.


#Members:
1. Fangzhou Xiong	A20376382    <fxiong4@hawk.iit.edu> 33.33%
2. Zhiquan  Li		A20381063	 <zli175@hawk.iit.edu>  33.33%
3. Guangda  Li		A20360157    <gli32@hawk.iit.edu>   33.33%


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
./src/BufferManger.js     Buffer manager
./src/Queue.js            queue for buffer manger FIFO and LRU
./src/BufferManagerHelper page handle
./src/BM_BufferPool       buffer pool handle
./test/test_assign1_1.js  test cases for storage manager
./test/test_assign2_1.js  test cases for buffer manger
./test/TestHelper         test helper


#API
--StorageManager

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

--BufferManager
1.  initBufferPool: initialize buffer pool

2.  shutdownBufferPool: shut down buffer pool

3.  forceFlushPool: write data of all dirty pages in buffer pool back page file

4.  markDirty: Mark a page dirty

5.  unpinPage: unpin a page

6.  forcePage: write data of a page in buffer pool back page file

7.  pinPage: pin a page

8.  getDirtyFlags: return all dirty page number

9.  getFixCounts: return fixcount

10. getNumReadIO: return the number of pages read from page file

11. getNumWriteIO: return the number of pages write into page file

12. FIFO: FIFO replacement strategy

13. LRU: LRU replacement strategy
