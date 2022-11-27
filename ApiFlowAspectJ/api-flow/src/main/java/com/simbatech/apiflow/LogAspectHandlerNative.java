package com.simbatech.apiflow;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.Random;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;
import org.yaml.snakeyaml.util.ArrayUtils;

/*
Refer README.md to integrate api-flow in main service/project
*/

@Aspect
public class LogAspectHandlerNative {
	private static final Logger log = LoggerFactory.getLogger(LogAspectHandlerNative.class);;

	int initPaddingLeft = 10;
	int paddingLeftIncr = 15;

	private static final String basePkg = "com.ctl.bmp.service.catalog_service";
	private static final String excludePkgs = " && !execution(* *.dto..*.*(..)) && !execution(* *.pojo..*.*(..)) && !execution(* *.repo..*.*(..)) && !execution(* *.error..*.*(..))";
	private static final String otherAspect = " && execution(* " + basePkg + "..*.wrapper..*.*(..)) && execution(* "
			+ basePkg + "..*.wrapper1..*.*(..))";

	private static final String controllerAspect = "execution(* " + basePkg + "..*.controller..*.*(..))" + " || "
			+ "execution(* " + basePkg + "..*.controllers..*.*(..))";
	private static final String serviceAspect = "execution(* " + basePkg + "..*.service..*.*(..))" + " || "
			+ "execution(* " + basePkg + "..*.services..*.*(..))";
	private static final String repositoryAspect = "execution(public * (@org.springframework.stereotype.Repository "
			+ basePkg + "..*).*(..))" + " || " + "execution(* " + basePkg + "..*.repository..*.*(..))" + "||"
			+ "execution(* " + basePkg + "..*.dao*..*.*(..))";// + "||"
			//+ "execution(* org.springframework.data.repository.core.support.QueryExecutionResultHandler.postProcessInvocationResult(..))";// ||
	private static final String defaultAspect = "com.nothing";
	private static final String httpClientAspect = "execution(* org.springframework.web.client.RestTemplate.exchange*(..)) || execution(* org.springframework.web.client.RestTemplate.*ForObject(..)) || execution(* org.springframework.web.client.RestTemplate.*ForEntity(..)) || execution(* org.springframework.web.reactive.function.client.WebClient.*(..))";

	private static final String pLeftFile = "pleft.txt";
	private static final String lastCLassMethod = "lastCLassMethod.txt";

	Properties prop = new Properties();
	@Value("${serviceAspect}")
	private String enabled;

	public LogAspectHandlerNative() throws Exception {
		try {
			prop.load(Thread.currentThread().getContextClassLoader().getResourceAsStream("application.properties"));
			System.out.println("controllerAspect=" + controllerAspect);
			System.out.println("serviceAspect=" + serviceAspect);
			System.out.println("repositoryAspect=" + repositoryAspect);
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

	@Around("httpClientPointcut()")
	public Object logAroundHttpClient(ProceedingJoinPoint joinPoint) throws Throwable {

		String paddingLeft = "0";
		String css = null;
		String url = null;

		try {
			Object[] args = joinPoint.getArgs();
			if (args.length > 0)
				url = args[0].toString();
			paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) + paddingLeftIncr) + "");
			css = String.format("padding-left:%spx;color:%s", (paddingLeft), "#0000ff");
			log.info(String.format(
					"htmlLog=><div style='%s'><i class='fa fa-cloud'></i>API=%s <strong>started</strong></div>", css,
					url));
			Object result = joinPoint.proceed();
			log.info(String.format(
					"htmlLog=><div style='%s'><i class='fa fa-cloud'></i>API=%s <strong>[ended]</strong></div>", css,
					url));

			paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) - paddingLeftIncr) + "");
			return result;
		} catch (Exception exn) {
			log.info(String.format(
					"htmlLog=><div style='%s'><i class='fa fa-cloud'></i>API failed=%s <strong>[ended]</strong></div>",
					css, exn.getMessage()));

			paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) - paddingLeftIncr) + "");

			throw exn;
		}
	}

	@Around("controller()")
	public Object logAroundController(ProceedingJoinPoint joinPoint) throws Throwable {
		String paddingLeft = "0";
		String css = null;
		String url = null;

		MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
		String className = joinPoint.getSignature().getDeclaringType().getSimpleName().split("\\$\\$")[0];
		String methodName = joinPoint.getSignature().getName();
		String classMethod = null;
		boolean showLog = true;

		try {
			if (exceptions.contains(methodName) || methodName.contains("$"))
				showLog = false;

			if (showLog) {
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) + paddingLeftIncr) + "");
				classMethod = String.format("%s.%s", className, methodName);// getMethodSignature(joinPoint);
				css = String.format("padding-left:%spx;color:%s", (paddingLeft), "#000000");

				log.info(String.format(
						"htmlLog=><div style=''><link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'></div>"));
				log.info(String.format(
						"htmlLog=><div style='%s'><i class='fa fa-play'></i> Class.method()=%s <strong>started</strong></div>",
						css, classMethod));
			}
			Object result = joinPoint.proceed();
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s'><i class='fa fa-stop'></i> Class.method()=%s <strong>[ended]</strong></div>",
						css, classMethod));

				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) - paddingLeftIncr) + "");
			}
			return result;
		} catch (Exception exn) {
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s'><i class='fa fa-stop'></i> Class.method()=%s<strong>[failed=%s]</strong></div>",
						css, classMethod, exn.getMessage()));

				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) - paddingLeftIncr) + "");
			}
			throw exn;
		}

	}

	private boolean checkRepeatedClassMethod(String classMethod) {
		if (classMethod.equals(readFile(lastCLassMethod))) {

			return true;
		} else {
			saveFile(lastCLassMethod, classMethod);
			return false;
		}
	}

	@Around("service()")
	public Object logAroundService(ProceedingJoinPoint joinPoint) throws Throwable {
		return htmlLog(joinPoint);
	}

	@Around("repository()")
	public Object logAroundRepository(ProceedingJoinPoint joinPoint) throws Throwable {
		String css = "";
		boolean showLog = false;
		String repoEntMethod = null;
		String paddingLeft = "0";
		String repo = null, rmethod = null;
		int lineNo = 0;

		try {
			MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
			String className = joinPoint.getSignature().getDeclaringType().getSimpleName().split("\\$\\$")[0];
			String methodName = joinPoint.getSignature().getName();
			Object[] args = joinPoint.getArgs();

			lineNo = joinPoint.getSourceLocation().getLine();

			if (args != null && args.length == 2) {
				try {
					showLog = true;
					if (args[0] == null) {
						repo = args[1].toString();
						repo = repo.substring(0, repo.lastIndexOf("."));
						repo = repo.substring(repo.lastIndexOf(".") + 1, repo.length());
					} else {
						repo = args[0].toString();
						repo = repo.substring(0, repo.indexOf("("));
					}
					rmethod = args[1].toString();
					rmethod = rmethod.substring(0, rmethod.lastIndexOf("("));
					rmethod = rmethod.substring(rmethod.lastIndexOf(".") + 1, rmethod.length());
				} catch (Exception e) {
					System.out.println(e.getMessage());
				}
			}

			if (showLog) {

				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) + paddingLeftIncr) + "");
				repoEntMethod = String.format("%s[%s].%s", repo, "E", rmethod);// getMethodSignature(joinPoint);
				css = String.format("padding-left:%spx;color:%s", (paddingLeft),
						String.format("#%06x", new Random().nextInt(0xffffff + 1)));
				log.info(String.format(
						"htmlLog=><div style='%s'>%s.<i class='fa fa-database'></i><span>Repo[Entity].method()=%s <strong>started</strong></span></div>",
						css, lineNo, repoEntMethod));
			}
			Object result = joinPoint.proceed();
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s'>%s.<i class='fa fa-database'></i><span>Repo[Entity].method()=%s <strong>[ended]</strong></span></div>",
						css, lineNo, repoEntMethod));
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) - paddingLeftIncr) + "");
			}
			return result;
		} catch (Exception exn) {
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s'>%s.<i class='fa fa-database'></i><span>Repo[Entity].method()=%s <strong>err=%s</strong></span></div>",
						css, lineNo, repoEntMethod, exn.getMessage()));
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) - paddingLeftIncr) + "");
			}
			throw exn;
		}

	}

	private List<String> exceptions = Arrays.asList("getIndex", "invoke");

	private Object htmlLog(ProceedingJoinPoint joinPoint) throws Throwable {
		String css = "";
		boolean showLog = true;
		String classMethod = null;
		String paddingLeft = "0";

		try {
			MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
			String className = joinPoint.getSignature().getDeclaringType().getSimpleName().split("\\$\\$")[0];
			String methodName = joinPoint.getSignature().getName();
			int lineNo = joinPoint.getSourceLocation().getLine();
			if (checkRepeatedClassMethod(methodSignature.toShortString()) || lineNo == 0
					|| exceptions.contains(methodName) || methodName.contains("$"))
				showLog = false;

			if (showLog) {
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) + paddingLeftIncr) + "");
				classMethod = String.format("%s.%s", className, methodName);// getMethodSignature(joinPoint);
				css = String.format("padding-left:%spx;color:%s", (paddingLeft),
						String.format("#%06x", new Random().nextInt(0xffffff + 1)));
				log.info(String.format("htmlLog=><div style='%s'>%s. Class.method()=%s <strong>started</strong></div>",
						css, lineNo, classMethod));
			}
			Object result = joinPoint.proceed();
			if (showLog) {
				log.info(String.format("htmlLog=><div style='%s'>%s. Class.method()=%s <strong>[ended]</strong></div>",
						css, lineNo, classMethod));
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) - paddingLeftIncr) + "");
			}
			return result;
		} catch (Exception exn) {
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s'>%s. Class.method()=%s err=%s <strong>[ended]</strong></div>", css,
						paddingLeft, classMethod, exn.getMessage()));
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile)) - paddingLeftIncr) + "");
			}
			throw exn;
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
	 * return result; } catch (Exception exn) {
	 * log.error("logAroundController=>class=%s,methodName=%s err=%s", className,
	 * methodName, exn.getMessage()); throw exn; }
	 * 
	 * }
	 */

	public String saveFile(String file, String data) {
		try (FileWriter fw = new FileWriter(file)) {
			fw.write(data);
		} catch (Exception e) {
			System.out.println(e);
		}
		return data;

	}

	public String readFile(String file) {

		List<String> lines = Collections.emptyList();
		try {
			if (!new File(file).exists()) {
				if (pLeftFile.equals(file))
					saveFile(file, initPaddingLeft + "");
				if (lastCLassMethod.equals(file))
					saveFile(file, null);
			}

			lines = Files.readAllLines(Paths.get(file), StandardCharsets.UTF_8);

		} catch (Exception fe) {
			System.out.println("File not found");
		}
		return (lines != null && lines.size() > 0 && StringUtils.hasLength(lines.get(0))) ? (lines.get(0)) : "0";
	}
}
