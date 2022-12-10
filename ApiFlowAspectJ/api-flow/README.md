***Setup native AspectJ support for logging like inner/private methods(Spring AOP proxy based not supported)

###---1---###
->import api-flow project in workspace(TBD: create jar so that no need to import)
->add dependency in main project
<dependency>
    <groupId>com.simbatech</groupId>
    <artifactId>api-flow</artifactId>
    <version>1.0.0</version>
</dependency>

->modify resources/META-INF/aop.xml file,(TBD:read from main app .properties file) 
  add  pkgs to scan under "<!-- add your packages to be advised here-->" <include/> tag.
->add pointcut expression in com.simbatech.apiflow.LogAspectHandlerNative  
->run main app add javaagent in VM argument:
  -javaagent:LOMBOK_JAR_PATH    (eg: C:\Users\ac49999\.m2\repository\org\aspectj\aspectjweaver\1.9.6\aspectjweaver-1.9.6.jar)
  -javaagent:ASPECTJWEAVER_JAR_PATH  

NB:see aspect weave log before spring app started.

###---2---###
NB:Before hitting api clean log file to get specific log info.

->in notepad++ paste all logs
->1. replace all with empty "":[preffered]
  =>(?!^.*htmlLog.*$)^.+\r?\n
  =>^.*(?=<div\s)
  =>(?!^.*at .*$)^.+\r?\n
->save file as .html and see 

->2. find->mark all tab:[alternate]
  =>check bookmark lines
  =>---(?!^.*htmlLog.*$)^.+\r?\n---  ===>replace all ""   [old:  ===>Go to Menu "Search - Bookmark - Remove bookmarked lines"]  
  =>---^.*(?=<div\s)---  ===>replace all ""
  =>---(?!^.*at .*$)^.+\r?\n---  ===>replace all ""  [old:  ===>Go to Menu "Search - Bookmark - Remove unbookmarked lines" [if required]]
->save file as .html and see 
