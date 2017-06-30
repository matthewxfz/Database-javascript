#layout
./
./dictionary
./schema/
./tables/
./views/
./indices

#Dictionary
For record data,
unspanned
attr: RID(8),isNUll(1),name(64), index(8), 72


#schema
records:
RID(8), isNull(1), attriName(64), dataType(1), typelength(4), isKey(1). 70+10 = 80 bytes.
first records:
lastRID(8),  keySize(8).


#Table 
records:
RID(8), isNUll(1), data,
first records:
lastRID(8), isSerielized(4)
