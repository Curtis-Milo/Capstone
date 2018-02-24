inF = file("in.txt","r")
outData= """\begin{table}
	\centering
	\begin{longtable}{| p{0.1\textwidth} | p{0.225\textwidth} | p{0.135\textwidth} | p{0.1\textwidth} | p{.1\textwidth} | p{0.1\textwidth} | p{0.1\textwidth} |}\hline 
		\rowcolor{tableCell}\textbf{Test Number} & \textbf{Description} & \textbf{Requirement Reference} & \textbf{Inputs} & \textbf{Expected Outputs} & \textbf{Actual Outputs}& \textbf{Results} \\ \hline
		"""
lines = inF.readlines()
inF.close()

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
               " & "+ expOutputs+" & "+actOutputs+" & "+ res +" \\\\ \hline  \n"
    outData= outData+tableRow


outData += "\\end{longtable}\n"
outData += "\\end{table}\n"

out = file("out.txt","w")
out.write(outData)
out.close()
