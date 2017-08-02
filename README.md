# Database-javascript
This is the relational SQL database build with node.js

Part 1- Storage Manager
The goal of this assignment is to implement a simple storage manager - a module that is capable of reading blocks 
from a file on disk into memory and writing blocks from memory to a file on disk.

Part 2- Buffer Manager
The goal of this assignment is to implement a buffer manager which manages a fixed number of pages in memory that represent pages from a page file managed by the storage manager.The Buffer manager should be able to handle more than one open buffer pool at the same time or one open buffer pool for each page file. FIFO and LRU replacement strategy implementations are required.

Part 3- Record Manager
The goal of this assignment is to implement a record manager which could handle tables with a fixed schema. The implementations of insertion, deletion, update and scan operation are required. 

#Members:
1. Fangzhou Xiong	A20376382    <fxiong4@hawk.iit.edu> 
2. Zhiquan  Li		A20381063	 <zli175@hawk.iit.edu>  
3. Guangda  Li		A20360157    <gli32@hawk.iit.edu>   


#Instruction of running program:
1. unpack the zip file to local
2. direct to the <rootworkpath>
3. run command: npm install mocha -g
4. To run the test case, run command: mocha <file path>
    I.E
    direct into the root dir of the project
    you should run : mocha ./test/test_assign3_1.js 

#dependency
./package.json

#layout
./src/DBErrors.js         command defined DBErrors
./src/Constants.js        Constants variable class
./src/BM                  Buffer manager
./src/RM                  Record Manager
./src/SM                  Storage Manger


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

9. 	readCurrentBlock	Read the current block from file on disk into memory

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

--RecordManager
1.  initRecordManager:      Initialize the Record Manager with a given entry to the buffer manager

2.  shutdownRecordManager:  Shut down the Record Manager

3.  initTableInfoPage:      Initialize table info page

4.  createTable:            Create table file with given name and schema

5.  openTable:              Open table

6.  closeTable:             Close table

7.  deleteTable:            Delete table

8.  getNumTuples:           Get total number of tuples in table

9.  insertRecord:           Insert records into table

10. deleteRecord:           Delete records from table

11. updateRecord:           Update records

12. getRecord:              Return Records

13. startScan:              Scan all the tuple in table with given condition

14. next:                   Give an next eligble record in table

15. closeScan:              Clost scan

16. getRecordSize:          Get size of each record

17. createSchema:           Create schema with given value

18. freeSchema:             Unset schema

19. createRecord:           Create empty record with given schema

20. freeRecord:             Unset record

21. getAttr:                Get the value of requested attribute

22. setAttr:                Update the value of requested attribute

