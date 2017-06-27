#Read page
Insert Record, 
1, get the final record RID from Table
2, insert into the page, 
    1, write to buffer(length = 8(RID) + 1(isNull) + variate(data))
    2, make dirty
    3, if there is no room for next record
        1, append a new page
        2, check schema for the length of record
        3, calc the slots number in a page
        4, write blank #slots (-1,-1)
    
Delete Record, 
1, read the page in RID.page in to bp
2, change record.isNull == 1
3, make the page dirty


Get Record, 
1, if rid.page or rid.slot is out boundary, err
2, read the page in RID.page in to bp
3, if page is null, return null


    
