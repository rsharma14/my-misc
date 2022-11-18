package com.ctl.bmp.service.catalog_service;

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
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import lombok.extern.slf4j.Slf4j;


/*
 in notepad++
 in find->mark all:
 check bookmar lines
 1. (?!^.*logAroundController=>.*$)^.+\r?\n    ===>Go to Menu "Search - Bookmark - Remove bookmarked lines"
 2. ^\r\n   && ^.*(?=<div\s)  ===>replace all ""
 

 */
@Aspect
@Component
@Slf4j
public class LogAspectHandler {
	
	int paddingLeft=10;

	@Pointcut("execution(* com.ctl.bmp..*.controller..*.*(..))")
	public void controller() {
	}

	@Pointcut("execution(* com.ctl.bmp.service..*.*(..))")
	public void service() {
	}

	
    @Around("controller()")
    public Object logAroundController(ProceedingJoinPoint joinPoint) throws Throwable {


        try {
        	paddingLeft=10;
            Object result = joinPoint.proceed();
            return result;
        } catch (Exception exn) {
            throw exn;
        }

    }
    
	@Around("service()")
	public Object logAroundService(ProceedingJoinPoint joinPoint) throws Throwable {

		long start = System.currentTimeMillis();
		String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
		String methodName = joinPoint.getSignature().getName();

		//return simpleLog(className, methodName, joinPoint);
		return htmlLog(className, methodName,joinPoint);

	}

	private Object simpleLog(String className, String methodName, ProceedingJoinPoint joinPoint) throws Throwable {
		try {
			log.info("logAroundController=>class={},methodName={} started", className, getMethodSignature(joinPoint));
			Object result = joinPoint.proceed();
			log.info("logAroundController=>class={},methodName={} ended", className, methodName);

			return result;
		} catch (Exception exn) {
			log.error("logAroundController=>class={},methodName={} err={}", className, methodName, exn.getMessage());
			throw exn;
		}

	}

	private Object htmlLog(String className, String methodName, ProceedingJoinPoint joinPoint) throws Throwable {
		String css=String.format("padding-left:%dpx;color:%s",(paddingLeft=paddingLeft+5),String.format("#%06x", new Random().nextInt(0xffffff + 1)));

		try {
			log.info("htmlLog=><div style='{}'>class={},methodName={} started</div>", css,className, getMethodSignature(joinPoint));
			Object result = joinPoint.proceed();
			log.info("htmlLog=><div style='{}'>class={},methodName={} ended</div>",css, className, methodName);

			return result;
		} catch (Exception exn) {
			log.info("htmlLog=><div style='{}'>class={},methodName={} err={}</div>",css, className, methodName,exn.getMessage());
			throw exn;
		}

	}

	private String getMethodSignature(ProceedingJoinPoint joinPoint) {

		MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
		Method method = methodSignature.getMethod();
//		if (method.getParameters().length > 0)
//			System.out.println(method.getParameters()[0].getParameterizedType().getTypeName());

		// return method.toString();//
		// return methodSignature.toShortString()
		// return methodSignature.toString()

		return String.format("%s %s %s(%s)", Modifier.toString(method.getModifiers()),
				method.getReturnType().getSimpleName(), method.getName(),
				Arrays.asList(method.getParameters()).stream()
						.map(m -> m.getParameterizedType().getTypeName()
								.substring(m.getParameterizedType().getTypeName().lastIndexOf(".") + 1))
						.collect(Collectors.toList()).toString().replace("[", "").replace("]", ""));

	}

}
