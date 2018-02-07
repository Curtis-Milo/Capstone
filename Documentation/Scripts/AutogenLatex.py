inF = file("in.txt","w")
outData= "\begin{table}[]\\n \
    \\centering\\n \
    \\caption{My caption}\\n \
    \\begin{tabular}{1lllll}\\n"
lines = inF.readlines()
tableRow = "Test Number & Discription & Inputs & Expected Outputs \
 & Actual Outputs & Results \\\\\\n"

outData= outData+tableRow
for i in range(len(lines)):
    data = lines[i].split(",")
    testNum =data[0]
    testDis = data[1]
    intputs = data[2]
    expOutputs = data[3]
    actOutputs = data[4]
    res= data[5]
    tableRow = testNum +" & "+testDis+" & "+intputs+\
               " & "+ expOutputs+" & "+actOutputs+" & "+ res +" \\\\\\n"
    outData= outData+tableRow
    
out = file("out.txt","w")
out.write(outData)
