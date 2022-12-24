package com.simbatech.apiflow;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Random;

import org.apache.commons.lang3.reflect.FieldUtils;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.ReflectiveMethodInvocation;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import sun.reflect.generics.reflectiveObjects.ParameterizedTypeImpl;

/*
Refer README.md to integrate api-flow in main service/project
*/

@Aspect
public class LogAspectHandlerNative2 {
	private static final Logger log = LoggerFactory.getLogger(LogAspectHandlerNative2.class);;

	private static final int initPaddingLeft = 10;
	private static final int paddingLeftIncr = 15;

	private static final String basePkg = "com.spring";
	private static final String excludePkgs = " && !call(* *..dto..*(..))  && !call(* *..pojo..*(..))  && !call(* *..entity..*(..))  && !call(* *..model..*(..))  && !call(* *..error..*(..))";

	private static final String otherServiceAspect = " || call(* " + basePkg + "..*.wrapper.*.*(..)) || call(* "
			+ basePkg + "..*.wrapper1.*.*(..))";

	private static final String controllerAspect = "execution(* " + basePkg + ".controller.*.*(..))" + " || "
			+ "execution(* " + basePkg + "..*.controller.*.*(..))" + " || " + "execution(* " + basePkg
			+ ".controllers.*.*(..))" + " || " + "execution(* " + basePkg + "..*.controllers.*.*(..))";

//	private static final String serviceAspect = "call(* " + basePkg + ".service.*.*(..))" + " || " + "call(* " + basePkg + "..*.service.*.*(..))" + " || " + "call(* " + basePkg + ".*.services.*.*(..))" + " || " + "call(* "	+ basePkg + "..services.*.*(..))" + otherServiceAspect + excludePkgs;
	private static final String serviceAspect = "call(* " + basePkg + "..*(..))" + excludePkgs ;
	private static final String repositoryAspect = "execution(* org.springframework.data.repository.core.support.RepositoryMethodInvoker.invoke*(..)) || execution(* org.springframework.data.repository.core.support.RepositoryFactorySupport.QueryExecutorMethodInterceptor.invoke*(..))";
	private static final String SimpleJpaRepository = "org.springframework.data.jpa.repository.support.SimpleJpaRepository";
	private static final String SimpleMongoRepository = "org.springframework.data.mongodb.repository.support.SimpleMongoRepository";

	private static final String WebClientClass ="org.springframework.web.reactive.function.client.ClientRequest.create";
	private static final String httpClientAspect = "execution(* org.springframework.web.client.RestTemplate.exchange*(..)) || execution(* org.springframework.web.client.RestTemplate.*ForObject(..)) || execution(* org.springframework.web.client.RestTemplate.*ForEntity(..)) || execution(* org.springframework.web.reactive.function.client.ClientRequest.create*(..))";

	private static final String pLeftFile = "pleft.txt";
	private static final String lastClassMethod = "lastClassMethod.txt";
	private static final String apiFLowFile = "api-flow.html";
	private List<String> exceptions = Arrays.asList("getIndex", "invoke","getTargetClass","getTargetSource","isFrozen","setCallbacks");

	Properties prop = new Properties();
	@Value("${serviceAspect}")
	private String enabled;

	public LogAspectHandlerNative2() throws Exception {
		try {
			prop.load(Thread.currentThread().getContextClassLoader().getResourceAsStream("application.properties"));
			log.info("controllerAspect=" + controllerAspect);
			log.info("serviceAspect=" + serviceAspect);
			log.info("repositoryAspect=" + repositoryAspect);
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	@Pointcut(controllerAspect)
	public void controller() {
	}

	@Pointcut(serviceAspect)
	public void service() {
	}

	@Pointcut(repositoryAspect)
	public void repository() {
	}

	@Pointcut(httpClientAspect)
	public void httpClientPointcut() {
	}

	@Around("controller()")
	public Object logAroundController(ProceedingJoinPoint joinPoint) throws Throwable {
		String paddingLeft = initPaddingLeft+"";
		String css = null;

		MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
		String className = joinPoint.getSignature().getDeclaringType().getSimpleName().split("\\$\\$")[0];
		String methodName = joinPoint.getSignature().getName();
		String classMethod = null;
		boolean showLog = true;
		int lineNo = joinPoint.getSourceLocation().getLine();

		try {
			if (exceptions.contains(methodName) || methodName.contains("$"))
				showLog = false;

			if (showLog) {
				deleteFile(pLeftFile);
				deleteFile(lastClassMethod);
				deleteFile(apiFLowFile);

				//saveFile(lastClassMethod, "", false);
				classMethod = String.format("%s.%s", className, methodName);// getMethodSignature(joinPoint);
				css = String.format("white-space: nowrap;padding-left:%spx;color:%s", (paddingLeft), "#000000");
				//log.info("htmlLog=><head> <meta name='viewport' content='width=device-width, initial-scale=1'> <link rel='stylesheet' 	href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'> <style> ul, #myUL { 	list-style-type: none; 	padding-inline-start: 0px; }  #myUL { 	margin: 0; 	padding: 0; }  .caret { 	cursor: pointer; }  </style> </head>");
				//saveFile(apiFLowFile, serviceAspect+"\n\n",true);

				//log.info(String.format("htmlLog=><ul id='myUL'><li><span class='caret' style='%s' title='Class.method line#%s'><strong><i class='fa fa-play'></i> %s</strong></span>",css, lineNo, classMethod));
				saveFile(apiFLowFile, String.format(
						"<head> <meta name='viewport' content='width=device-width, initial-scale=1'> <link rel='stylesheet' 	href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'> <style> ul, #myUL { 	list-style-type: none; 	padding-inline-start: 0px; }  #myUL { 	margin: 0; 	padding: 0; }  .caret { 	cursor: pointer; }  </style> </head>"),
						true);
				saveFile(apiFLowFile, String.format(
						"\n<ul id='myUL'><li><span class='caret' style='%s' title='Class.method line#%s'><strong><i class='fa fa-play'></i> %s</strong></span>",
						css, lineNo, classMethod), true);
			}
			Object result = joinPoint.proceed();
			if (showLog) {
				//log.info(String.format("htmlLog=><li><span  class='caret' style='%s' title='Class.method line#%s'><strong><i class='fa fa-stop'></i> %s</strong></span></li></li></ul>",css, lineNo, classMethod));
				//log.info("htmlLog=><script> 	var toggler = document.getElementsByClassName('caret'); 	var i; 	for (i = 0; i < toggler.length; i++) { 	 	toggler[i].addEventListener('click', function() { 	let rgbaChild=this.style.color.replaceAll(')','').split(','); 	let rgbaParent=this.closest('ul').style.backgroundColor.split(','); if(rgbaParent?.length==4){ this.closest('ul').style.backgroundColor=''; this.closest('ul').style.border='';  }else if(rgbaChild?.length==3){ rgbaChild.push(0.1+')'); 	this.closest('ul').style.backgroundColor=rgbaChild.toString(); 	this.closest('ul').style.border='1px dashed '+this.style.color;  } 		  }); 	  } </script>");

				saveFile(apiFLowFile, String.format(
						"\n<li><span  class='caret' style='%s' title='Class.method line#%s'><strong><i class='fa fa-stop'></i> %s</strong></span></li></li></ul>",
						css, lineNo, classMethod), true);
				saveFile(apiFLowFile,
						"\n<script> 	var toggler = document.getElementsByClassName('caret'); 	var i; 	for (i = 0; i < toggler.length; i++) { 	 	toggler[i].addEventListener('click', function() { 	let rgbaChild=this.style.color.replaceAll(')','').split(','); 	let rgbaParent=this.closest('ul').style.backgroundColor.split(','); if(rgbaParent?.length==4){ this.closest('ul').style.backgroundColor=''; this.closest('ul').style.border='';  }else if(rgbaChild?.length==3){ rgbaChild.push(0.1+')'); 	this.closest('ul').style.backgroundColor=rgbaChild.toString(); 	this.closest('ul').style.border='1px dashed '+this.style.color;  } 		  }); 	  } </script>",
						true);
				String newFile=String.format("%s.html",classMethod+"_"+new SimpleDateFormat("yyyyMMddhhmmSS").format(new Date()));
				renameFile(apiFLowFile, newFile);
				
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			return result;
		} catch (Exception e) {
			if (showLog) {
				//log.info(String.format("htmlLog=><li><span  class='caret' style='%s' title='Class.method line#%s'><strong><i class='fa fa-stop'></i><i class='fa fa-exclamation-triangle' style='color:red;'></i> %s...err=%s</strong><span></li></li></ul>",css, lineNo, classMethod, e.getMessage()));
				saveFile(apiFLowFile, String.format(
						"\n<li><span  class='caret' style='%s' title='Class.method line#%s'><strong><i class='fa fa-stop'></i><i class='fa fa-exclamation-triangle' style='color:red;'></i> %s...err=%s</strong></span></li></li></ul>",
						css, lineNo, classMethod, e.getMessage()), true);
				saveFile(apiFLowFile,
						"\n<script> 	var toggler = document.getElementsByClassName('caret'); 	var i; 	for (i = 0; i < toggler.length; i++) { 	 	toggler[i].addEventListener('click', function() { 	let rgbaChild=this.style.color.replaceAll(')','').split(','); 	let rgbaParent=this.closest('ul').style.backgroundColor.split(','); if(rgbaParent?.length==4){ this.closest('ul').style.backgroundColor=''; this.closest('ul').style.border='';  }else if(rgbaChild?.length==3){ rgbaChild.push(0.1+')'); 	this.closest('ul').style.backgroundColor=rgbaChild.toString(); 	this.closest('ul').style.border='1px dashed '+this.style.color;  } 		  }); 	  } </script>",
						true);

				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			throw e;
		}

	}

	@Around("service()")
	public Object logAroundService(ProceedingJoinPoint joinPoint) throws Throwable {
		String css = "";
		boolean showLog = true;
		boolean isRepeated = false;
		String classMethod = null;
		String paddingLeft = "0";
		int lineNo = joinPoint.getSourceLocation().getLine();

		try {
			MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
			String className = joinPoint.getSignature().getDeclaringType().getSimpleName().split("\\$\\$")[0];
			String methodName = joinPoint.getSignature().getName();
			String txt = lineNo + ":" + (Integer.parseInt(readFile(pLeftFile, false)) + paddingLeftIncr) + ":"
					+ methodSignature.toShortString();
			
			if (checkRepeatedClassMethod(txt)) {
				showLog = false;
				isRepeated = true;
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) + paddingLeftIncr) + "",
						false);
			}
			if (lineNo == 0 || exceptions.contains(methodName) || methodName.contains("$")) {
				showLog = false;
			}

			if (showLog) {
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) + paddingLeftIncr) + "",
						false);
				classMethod = String.format("%s %s.%s", Modifier.toString(joinPoint.getSignature().getModifiers()),
						className, methodName);
				css = String.format("white-space: nowrap;padding-left:%spx;color:%s", (paddingLeft), getHexColor());
				//log.info(String.format("htmlLog=><ul class='nested'><li><span  class='caret' style='%s' title='Class.method line#%s'><i class='fa fa-play'></i> %s  Line#%s</span>",css, lineNo, classMethod, lineNo));
				saveFile(apiFLowFile, String.format(
						"\n<ul class='nested'><li><span  class='caret' style='%s' title='Class.method line#%s'><i class='fa fa-play'></i> %s  Line#%s</span>",
						css, lineNo, classMethod, lineNo), true);
			}
			Object result = joinPoint.proceed();
			if (showLog) {
				//log.info(String.format("htmlLog=><li><span  class='caret' style='%s' title='Class.method line#%s'><i class='fa fa-stop'></i> %s</span></li></li></ul>",	css, lineNo, classMethod));
				saveFile(apiFLowFile, String.format(
						"\n<li><span  class='caret' style='%s' title='Class.method line#%s'><i class='fa fa-stop'></i> %s</span></li></li></ul>",
						css, lineNo, classMethod), true);
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			if (isRepeated) {
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			return result;
		} catch (Exception e) {
			if (showLog) {
				//log.info(String.format("htmlLog=><li><span  class='caret' style='%s' title='Class.method line#%s'><i class='fa fa-stop'></i><i class='fa fa-exclamation-triangle' style='color:red;'></i> %s...err=%s</span></li></li></ul>",css, lineNo, classMethod, e.getMessage()));
				saveFile(apiFLowFile, String.format(
						"\n<li><span  class='caret' style='%s' title='Class.method line#%s'><i class='fa fa-stop'></i><i class='fa fa-exclamation-triangle' style='color:red;'></i> %s...err=%s</span></li></li></ul>",
						css, lineNo, classMethod, e.getMessage()), true);
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			if (isRepeated) {
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			throw e;
		}

	}

	@Around("repository()")
	public Object logAroundRepository(ProceedingJoinPoint joinPoint) throws Throwable {
		String css = "";
		String paddingLeft = "0";
		int lineNo = joinPoint.getSourceLocation().getLine();
		Map<String, String> map = new HashMap<>();

		map.put("repoClass", "N/A");
		map.put("entity", "N/A");
		map.put("rmethod", "N/A");
		map.put("showLog", null);
		String classMethod = "N/A";
		boolean showLog = false;

		try {
			getRepoEntMethod(joinPoint, map);
			showLog = StringUtils.hasLength(map.get("showLog"));

			if (showLog) {

				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) + paddingLeftIncr) + "",
						false);
				css = String.format("white-space: nowrap;padding-left:%spx;color:%s", (paddingLeft), getHexColor());
				classMethod = String.format("%s %s.%s[%s]", Modifier.toString(joinPoint.getSignature().getModifiers()),
						map.get("repoClass"), map.get("rmethod"), map.get("entity"));// getMethodSignature(joinPoint);

				//log.info(String.format("htmlLog=><li><span style='%s' title='Class.method[Entity] line#%s'> <i class='fa fa-database'> %s</i></span></li>",	css, lineNo, classMethod));
				saveFile(apiFLowFile, String.format(
						"\n<li><span style='%s' title='Class.method[Entity] line#%s'> <i class='fa fa-database'> %s</i></span></li>",
						css, lineNo, classMethod), true);
			}
			Object result = joinPoint.proceed();
			if (showLog) {
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			return result;
		} catch (Exception e) {
			if (showLog) {
				//log.info(String.format("htmlLog=><li><span style='%s' title='Class.method[Entity] line#%s'><i class='fa fa-database'></i> <i class='fa fa-exclamation-triangle' style='color:red;'></i>  %s...err=%s</span></li>",css, lineNo, classMethod, e.getMessage()));
				saveFile(apiFLowFile, String.format(
						"\n<li><span style='%s' title='Class.method[Entity] line#%s'><i class='fa fa-database'></i> <i class='fa fa-exclamation-triangle' style='color:red;'></i>  %s...err=%s</span></li>",
						css, lineNo, classMethod, e.getMessage()), true);
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			throw e;
		}

	}

	private String getHexColor() {
		// TODO Auto-generated method stub
		return String.format("#%06x", new Random().nextInt(0xffffff + 1));
	}

	@Around("httpClientPointcut()")
	public Object logAroundHttpClient(ProceedingJoinPoint joinPoint) throws Throwable {

		String paddingLeft = "0";
		String css = null;
		String url = null;
		int lineNo = joinPoint.getSourceLocation().getLine();
		try {
			String className = joinPoint.getSignature().getDeclaringType().getName().split("\\$\\$")[0];
			String methodName = joinPoint.getSignature().getName();

			Object[] args = joinPoint.getArgs();

			if (WebClientClass.equals(String.format("%s.%s", className, methodName))) {
				if (args.length == 2)
					url = args[1].toString();
			} else {
				if (args.length > 0)
					url = args[0].toString();
			}

			paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) + paddingLeftIncr) + "",
					false);
			css = String.format("white-space: nowrap;padding-left:%spx;color:%s", (paddingLeft), "#0000ff");
			// log.info(String.format("htmlLog=><li><span style='%s' title='API line#%s'><i
			// class='fa fa-cloud'></i> %s</span></li>", css, lineNo, url));
			saveFile(apiFLowFile,
					String.format(
							"\n<li><span style='%s'  title='API line#%s'><i class='fa fa-cloud'></i> %s</span></li>",
							css, lineNo, url),
					true);
			Object result = joinPoint.proceed();
			// log.info(String.format(
			// "htmlLog=><span style='%s' title='API line#%s'><i class='fa fa-cloud'></i>
			// %s</div>",
			// css, lineNo, url));

			paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
					false);
			return result;
		} catch (Exception e) {
			// log.info(String.format("htmlLog=><li><span style='%s' title='API line#%s'><i
			// class='fa fa-cloud'></i> <i class='fa fa-exclamation-triangle'
			// style='color:red;'></i> %s...err=%s</span></li>",css, lineNo, url,
			// e.getMessage()));
			saveFile(apiFLowFile, String.format(
					"\n<li><span style='%s'  title='API line#%s'><i class='fa fa-cloud'></i> <i class='fa fa-exclamation-triangle' style='color:red;'></i> %s...err=%s</span></li>",
					css, lineNo, url, e.getMessage()), true);
			paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
					false);

			throw e;
		}
	}

	private boolean getRepoEntMethod(ProceedingJoinPoint joinPoint, Map<String, String> map) {

		return getRepoEntMethodNew(joinPoint, map) || getRepoEntMethodOld(joinPoint, map);

	}

	private boolean getRepoEntMethodOld(ProceedingJoinPoint joinPoint, Map<String, String> map) {
		boolean ret = false;
		try {
			Class<?> invokerCls = Class.forName(
					"org.springframework.data.repository.core.support.RepositoryFactorySupport$QueryExecutorMethodInterceptor");
			Object thisJP = joinPoint.getThis();
			Object[] args = joinPoint.getArgs();

			Map<Method, Object> md = (Map<Method, Object>) FieldUtils.getDeclaredField(invokerCls, "queries", true)
					.get(thisJP);

			if (!ObjectUtils.isEmpty(args) && args[0] instanceof ReflectiveMethodInvocation) {
				ReflectiveMethodInvocation rmi = (ReflectiveMethodInvocation) args[0];
				Class<?> mainRepo = rmi.getThis().getClass();
				map.put("repoClass", mainRepo.getSimpleName());
				map.put("rmethod", rmi.getMethod().getName());
				if (mainRepo.getName().equals(SimpleJpaRepository)) {
					invokerCls = Class.forName(SimpleJpaRepository);
				} else if (mainRepo.getName().equals(SimpleMongoRepository)) {
					invokerCls = Class.forName(SimpleMongoRepository);
				}

				Object obj = FieldUtils.getDeclaredField(invokerCls, "entityInformation", true).get(rmi.getThis());
				ExtractBean extractBean = new ExtractBean();
				BeanUtils.copyProperties(obj, extractBean);
				invokerCls = Class
						.forName("org.springframework.data.repository.core.support.AbstractEntityInformation");
				// obj = FieldUtils.getDeclaredField(invokerCls, "domainClass", true).get(obj);
				// BeanUtils.copyProperties(obj, extractBean);

				map.put("entity", obj.getClass().getSimpleName());// extractBean.getEntityName();
				map.put("showLog", "true");
				ret = true;
			}
			if (!CollectionUtils.isEmpty(md)) {
				List<Method> lm = new ArrayList<>(md.keySet());
				// map.put("rmethod", lm.get(0).getName());
				map.put("repoClass", lm.get(0).getDeclaringClass().getSimpleName());
				Type[] types = lm.get(0).getDeclaringClass().getGenericInterfaces();
				if (types.length > 0 && types[0] instanceof ParameterizedTypeImpl) {
					ParameterizedTypeImpl pt = (ParameterizedTypeImpl) types[0];
					map.put("entity", ((Class<?>) pt.getActualTypeArguments()[0]).getSimpleName());
				}
				map.put("showLog", "true");
				ret = true;
			}
		} catch (Exception e) {
			log.error("getRepoEntMethodOld=" + e.getMessage());
		}
		return ret;
	}

	private boolean getRepoEntMethodNew(ProceedingJoinPoint joinPoint, Map<String, String> map) {
		boolean ret = false;
		try {
			Class<?> invokerCls = Class
					.forName("org.springframework.data.repository.core.support.RepositoryMethodInvoker");
			MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
			Object[] args = joinPoint.getArgs();
			Object thisJP = joinPoint.getThis();
			Method md = (Method) FieldUtils.getDeclaredField(invokerCls, "method", true).get(thisJP);
			ParameterizedTypeImpl pt = null;
			if (args.length == 3) {
				map.put("repoClass", ((Class<?>) args[0]).getSimpleName());
				Type[] types = ((Class<?>) args[0]).getGenericInterfaces();
				if (types.length > 0 && types[0] instanceof ParameterizedTypeImpl) {
					pt = (ParameterizedTypeImpl) types[0];
					map.put("entity", ((Class<?>) pt.getActualTypeArguments()[0]).getSimpleName());
				}
				map.put("rmethod", md.getName());
				map.put("showLog", "true");
				ret = true;
			}
		} catch (Exception e) {
			log.error("getRepoEntMethodNew=" + e.getMessage());
		}

		return ret;
	}

	private boolean checkRepeatedClassMethod(String classMethod) {
		if (readFile(lastClassMethod, true).contains(classMethod)) {
			return true;
		} else {
			saveFile(lastClassMethod, classMethod, true);
			return false;
		}
	}


	private String getMethodSignature(ProceedingJoinPoint joinPoint) {

		MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
		Method method = methodSignature.getMethod();
		String className = joinPoint.getSignature().getDeclaringType().getSimpleName().split("\\$\\$")[0];
		String methodName = joinPoint.getSignature().getName();

//		if (method.getParameters().length > 0)
//			System.out.println(method.getParameters()[0].getParameterizedType().getTypeName());

		// return method.toString();//
		// return methodSignature.toShortString();
		// return methodSignature.toString();
		return String.format("%s.%s", className, method.getName());

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

	/*
	 * private Object simpleLog( ProceedingJoinPoint joinPoint) throws Throwable {
	 * try {
	 * log.info(String.format("logAroundController=>class=%s,methodName=%s started",
	 * className, getMethodSignature(joinPoint))); Object result =
	 * joinPoint.proceed();
	 * log.info(String.format("logAroundController=>class=%s,methodName=%s ended",
	 * className, methodName));
	 * 
	 * return result; } catch (Exception e) {
	 * log.error("logAroundController=>class=%s,methodName=%s err=%s", className,
	 * methodName, e.getMessage()); throw e; }
	 * 
	 * }
	 */

	public String saveFile(String file, String data, boolean writeFresh) {
		try (FileWriter fw = new FileWriter(file, writeFresh)) {
			fw.write(data);
		} catch (Exception e) {
			log.error("saveFile file="+file+" err=>" + e.getMessage());
		}
		return data;

	}

	public String readFile(String file, boolean allLines) {

		List<String> lines = Collections.emptyList();
		try {
			if (!new File(file).exists()) {
				if (pLeftFile.equals(file))
					saveFile(file, initPaddingLeft + "", false);
				if (lastClassMethod.equals(file))
					saveFile(file, null, false);
			}

			lines = Files.readAllLines(Paths.get(file), StandardCharsets.UTF_8);

		} catch (Exception e) {
			log.error("readFile file="+file+" err=>" + e.getMessage());
		}
		// if(allLines)
		// return lines.toString();

		return (lines != null && lines.size() > 0 && StringUtils.hasLength(lines.get(0))) ? (lines.get(0)) : "0";
	}

	private boolean renameFile(String source, String target) {

		try {

			Files.move(Paths.get(source), Paths.get(target), StandardCopyOption.REPLACE_EXISTING);
			return true;

		} catch (IOException e) {
			log.error("renameFile file="+source+" err=>" + e.getMessage());
		}

		return false;
	}

	private static boolean deleteFile(String file) {
		File f = new File(file);
		try {
			FileUtils.forceDelete(new File(file));
			return true;

		} catch (Exception e) {
			log.error("deleteFile file=" + file + " err=>" + e.getMessage());

		}

		return false;
	}
	 
	class ExtractBean {
		private String entityName;
		private Object metadata;

		public String getEntityName() {
			return entityName;
		}

		public void setEntityName(String entityName) {
			this.entityName = entityName;
		}

		public Object getMetadata() {
			return metadata;
		}

		public void setMetadata(Object metadata) {
			this.metadata = metadata;
		}

	}
}

/*
 * @Around("repository2()") public Object
 * logAroundRepository2(ProceedingJoinPoint joinPoint) throws Throwable {
 * Class<?> invokerCls=Class.forName(
 * "org.springframework.data.repository.core.support.RepositoryMethodInvoker");
 * MethodSignature methodSignature = (MethodSignature)
 * joinPoint.getStaticPart().getSignature(); String className =
 * joinPoint.getSignature().getDeclaringType().getSimpleName().split("\\$\\$")[0
 * ]; String methodName = joinPoint.getSignature().getName(); Object
 * target=joinPoint.getTarget(); Object[] args = joinPoint.getArgs(); Object
 * thisJP=joinPoint.getThis(); Method md=(Method)
 * FieldUtils.getDeclaredField(invokerCls, "method", true).get(thisJP);
 * 
 * String repoClass=null,entity=null,method=null; if(args.length==3) {
 * repoClass=((Class)args[0]).getSimpleName(); Type[]
 * types=((Class)args[0]).getGenericInterfaces();
 * //getSimpleName();//.getClass().getName();//getSimpleName();
 * if(types.length>0 && types[0] instanceof ParameterizedTypeImpl) {
 * ParameterizedTypeImpl pt=(ParameterizedTypeImpl) types[0];
 * entity=((Class)pt.getActualTypeArguments()[0]).getSimpleName(); }
 * method=md.getName(); }
 * 
 * log.info("repoClass="+repoClass+" : entity="+entity+": method="+method);
 * ObjectMapper om=new ObjectMapper(); Field
 * qw=invokerCls.getDeclaredField("method"); qw.setAccessible(true); //// Method
 * aaa=(Method) qw.get(thisJP); //// Field
 * qq=FieldUtil.getField(thisJP.getClass(), "method"); //// Field
 * q=a.getField("method"); //// Field[] f=a.getFields(); // for(int
 * i=0;i<f.length;i++) { // System.out.println(f[i].getName()); // } //
 * om.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false); //
 * Obj o=new Obj(); // BeanUtils.copyProperties(thisJP, o); // String
 * aa=om.writeValueAsString(thisJP);
 * 
 * log.info(joinPoint.toString()); log.info(Arrays.toString(args));
 * 
 * Object result = joinPoint.proceed();
 * 
 * return result; }
 */
