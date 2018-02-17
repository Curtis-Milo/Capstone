inF = file("in.txt","w")
outData= "\\begin{table}[]\\n \
    \\centering\\n \
    \\caption{My caption}\\n \
    \\begin{tabular}{11lllll}\\n"
lines = inF.readlines()
tableRow = "Test Number & Discription & Requirement Reference & Inputs & Expected Outputs \
 & Actual Outputs & Results \\\\\\n"

outData= outData+tableRow
for i in range(len(lines)):
    data = lines[i].split(",")
    testNum =data[0]
    testDis = data[1]
    reqDis = data[2]
    intputs = data[3]
    expOutputs = data[4]
    actOutputs = data[5]
    res= data[6]
    tableRow = testNum +" & "+testDis+" & "+reqDis+" & "+intputs+\
               " & "+ expOutputs+" & "+actOutputs+" & "+ res +" \\\\\\n"
    outData= outData+tableRow
    
out = file("out.txt","w")
out.write(outData)
