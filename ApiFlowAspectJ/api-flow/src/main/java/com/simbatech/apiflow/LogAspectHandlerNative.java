package com.simbatech.apiflow;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import lombok.extern.slf4j.Slf4j;

/*
 ***Setup native AspectJ support for logging like inner/private methods(Spring AOP proxy based not supported)
 ->add META-INF/aop.xml file content:
 <aspectj>
    <aspects>
        <aspect name="com.LogAspectHandlerNative"/>  <!-- Aspect class -->
        <weaver options="-verbose -showWeaveInfo">
            <include within="com.spring..*"/> <!-- pkg to waive -->
        </weaver>
    </aspects>
</aspectj>

###optional###
-> install AspectJ Development Tools (AJDT) plugin in STS ide
->from project's .classpath file add 
  <classpathentry kind="con" path="org.eclipse.ajdt.core.ASPECTJRT_CONTAINER"/>
->from project's .project file add
  <buildCommand><name>org.eclipse.ajdt.core.ajbuilder</name><arguments></arguments></buildCommand>
->above 2 can be configured in pom.xml(TBD)  
######
->while running app add javaagent in VM argument
-javaagent:C:\Users\ac49999\Rajendra\1.ADE\1.ADE\sts-4.6.1.RELEASE\lombok.jar
-javaagent:C:/Users/ac49999/.m2/repository/org/aspectj/aspectjweaver/1.9.6/aspectjweaver-1.9.6.jar  


 in notepad++ find->mark all:
 check bookmar lines
 1. (?!^.*htmlLog.*$)^.+\r?\n    ===>Go to Menu "Search - Bookmark - Remove bookmarked lines"
 2. (?!^.*at .*$)^.+\r?\n    ===>Go to Menu "Search - Bookmark - Remove unbookmarked lines"
 3. ^.*(?=<div\s)  ===>replace all ""
 
----in prop----
logging.level.org.springframework=INFO
logging.level.org.springframework.web=error
logging.level.org.hibernate=DEBUG
logging.level.org.hibernate.stat=debug
logging.level.org.springframework.data.*.*=trace
 */

@Aspect
public class LogAspectHandlerNative {
	private static final Logger log = LoggerFactory.getLogger(LogAspectHandlerNative.class);;

	int paddingLeft = 10;
	int paddingLeftIncr = 15;

	@Pointcut("execution(* com.simbatech.apiflow.spring..*(..))")
	public void service() {
	}


	@Around("service()")
	public Object logAroundService(ProceedingJoinPoint joinPoint) throws Throwable {

		String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
		String methodName = joinPoint.getSignature().getName();

		// return simpleLog(className, methodName, joinPoint);
		return htmlLog(className, methodName, joinPoint);

	}

	private Object htmlLog(String className, String methodName, ProceedingJoinPoint joinPoint) throws Throwable {
		String css = String.format("padding-left:%dpx;color:%s", (paddingLeft = paddingLeft + paddingLeftIncr),
				String.format("#%06x", new Random().nextInt(0xffffff + 1)));

		try {
			// log.info(String.format("htmlLog=><div style='%s'>class=%s,methodName=%s
			// started</div>",
			// css, className,getMethodSignature(joinPoint));
			log.info(String.format("htmlLog=><div style='%s'>%s. Class.method()=%s <strong>started</strong></div>", css,
					paddingLeft, getMethodSignature(joinPoint)));
			Object result = joinPoint.proceed();
			log.info(String.format("htmlLog=><div style='%s'>%s. Class.method()=%s <strong>[ended]</strong></div>", css,
					paddingLeft, getMethodSignature(joinPoint)));
			paddingLeft = paddingLeft - paddingLeftIncr;
			return result;
		} catch (Exception exn) {
			log.info(String.format(
					"htmlLog=><div style='%s'>%s. Class.method()=%s err=%s <strong>[ended]</strong></div>", css,
					paddingLeft, getMethodSignature(joinPoint), exn.getMessage()));
			paddingLeft = paddingLeft - paddingLeftIncr;
			throw exn;
		}

	}

	private String getMethodSignature(ProceedingJoinPoint joinPoint) {

		MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
		Method method = methodSignature.getMethod();
//		if (method.getParameters().length > 0)
//			System.out.println(method.getParameters()[0].getParameterizedType().getTypeName());

		// return method.toString();//
		return methodSignature.toShortString();
		// return methodSignature.toString();

		/*
		 * return String.format("%s %s %s(%s)",
		 * Modifier.toString(method.getModifiers()),
		 * method.getReturnType().getSimpleName(), method.getName(),
		 * Arrays.asList(method.getParameters()).stream() .map(m ->
		 * m.getParameterizedType().getTypeName()
		 * .substring(m.getParameterizedType().getTypeName().lastIndexOf(".") + 1))
		 * .collect(Collectors.toList()).toString().replace("[", "").replace("]", ""));
		 */

	}

}
