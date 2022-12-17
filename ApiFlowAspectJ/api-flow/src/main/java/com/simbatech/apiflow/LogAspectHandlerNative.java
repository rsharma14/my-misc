package com.simbatech.apiflow;

import java.io.File;
import java.io.FileWriter;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Random;

import org.apache.commons.lang3.reflect.FieldUtils;
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
public class LogAspectHandlerNative {
	private static final Logger log = LoggerFactory.getLogger(LogAspectHandlerNative.class);;

	int initPaddingLeft = 10;
	int paddingLeftIncr = 15;

	private static final String basePkg = "com";
	private static final String excludePkgs = " && !execution(* *.dto..*.*(..)) && !execution(* *.pojo..*.*(..)) && !execution(* *.repo..*.*(..)) && !execution(* *.error..*.*(..))";
	private static final String otherAspect = " && execution(* " + basePkg + "..*.wrapper..*.*(..)) && execution(* "
			+ basePkg + "..*.wrapper1..*.*(..))";

	private static final String controllerAspect = "execution(* " + basePkg + ".controller.*.*(..))" + " || "
			+ "execution(* " + basePkg + "..*.controller.*.*(..))" + " || " + "execution(* " + basePkg
			+ ".controllers.*.*(..))" + " || " + "execution(* " + basePkg + "..*.controllers.*.*(..))";
	private static final String serviceAspect = "call(* " + basePkg + ".service.*.*(..))" + " || " + "call(* " + basePkg
			+ "..*.service.*.*(..))" + " || " + "call(* " + basePkg + "..*.services.*.*(..))" + " || " + "call(* "
			+ basePkg + ".services.*.*(..))";
	private static final String repositoryAspect = "execution(* org.springframework.data.repository.core.support.RepositoryMethodInvoker.invoke*(..))"
			+ " || "
			+ "execution(* org.springframework.data.repository.core.support.RepositoryFactorySupport.QueryExecutorMethodInterceptor.invoke*(..))";

	private static final String defaultAspect = "com.nothing";
	private static final String httpClientAspect = "execution(* org.springframework.web.client.RestTemplate.exchange*(..)) || execution(* org.springframework.web.client.RestTemplate.*ForObject(..)) || execution(* org.springframework.web.client.RestTemplate.*ForEntity(..)) || execution(* org.springframework.web.reactive.function.client.WebClient.*(..))";

	private static final String pLeftFile = "pleft.txt";
	private static final String lastClassMethod = "lastClassMethod.txt";
	private static final String SimpleJpaRepository = "org.springframework.data.jpa.repository.support.SimpleJpaRepository";
	private static final String SimpleMongoRepository = "org.springframework.data.mongodb.repository.support.SimpleMongoRepository";

	Properties prop = new Properties();
	@Value("${serviceAspect}")
	private String enabled;

	public LogAspectHandlerNative() throws Exception {
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
		String paddingLeft = "0";
		String css = null;
		String url = null;

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
				paddingLeft = saveFile(pLeftFile, (initPaddingLeft) + "", false);
				saveFile(lastClassMethod, "", false);
				classMethod = String.format("%s.%s", className, methodName);// getMethodSignature(joinPoint);
				css = String.format("padding-left:%spx;color:%s", (paddingLeft), "#000000");

				log.info(String.format(
						"htmlLog=><div style=''><link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'></div>"));
				log.info(String.format(
						"htmlLog=><div style='%s' title='Class.method line#%s'><strong><i class='fa fa-play'></i> %s</strong></div>",
						css, lineNo, classMethod));
			}
			Object result = joinPoint.proceed();
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s' title='Class.method line#%s'><strong><i class='fa fa-stop'></i> %s</strong></div>",
						css, lineNo, classMethod));

				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			return result;
		} catch (Exception e) {
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s' title='Class.method line#%s'><strong><i class='fa fa-stop'></i><i class='fa fa-exclamation-triangle' style='color:red;'></i> %s...err=%s</strong></div>",
						css, lineNo, classMethod, e.getMessage()));

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
		String classMethod = null;
		String paddingLeft = "0";
		int lineNo = joinPoint.getSourceLocation().getLine();

		try {
			MethodSignature methodSignature = (MethodSignature) joinPoint.getStaticPart().getSignature();
			String className = joinPoint.getSignature().getDeclaringType().getSimpleName().split("\\$\\$")[0];
			String methodName = joinPoint.getSignature().getName();
			String txt = lineNo + ":" + (Integer.parseInt(readFile(pLeftFile, false)) + paddingLeftIncr) + ":"
					+ methodSignature.toShortString();
			if (checkRepeatedClassMethod(txt) || lineNo == 0 || exceptions.contains(methodName)
					|| methodName.contains("$"))
				showLog = false;

			if (showLog) {
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) + paddingLeftIncr) + "",
						false);
				// classMethod = String.format("%s
				// %s.%s",Modifier.toString(joinPoint.getSignature().getModifiers()), className,
				// methodName);// getMethodSignature(joinPoint);
				classMethod = String.format("%s %s.%s", Modifier.toString(joinPoint.getSignature().getModifiers()),
						className, methodName);
				css = String.format("padding-left:%spx;color:%s", (paddingLeft),
						String.format("#%06x", new Random().nextInt(0xffffff + 1)));
				log.info(String.format(
						"htmlLog=><div style='%s' title='Class.method line#%s'><i class='fa fa-play'></i> %s  Line#%s</div>",
						css, lineNo, classMethod,lineNo));
			}
			Object result = joinPoint.proceed();
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s' title='Class.method line#%s'><i class='fa fa-stop'></i> %s</div>",
						css, lineNo, classMethod));
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			return result;
		} catch (Exception e) {
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s' title='Class.method line#%s'><i class='fa fa-stop'></i><i class='fa fa-exclamation-triangle' style='color:red;'></i> %s...err=%s</div>",
						css, lineNo, classMethod, e.getMessage()));
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
				css = String.format("padding-left:%spx;color:%s", (paddingLeft),
						String.format("#%06x", new Random().nextInt(0xffffff + 1)));
				classMethod = String.format("%s %s.%s[%s]", Modifier.toString(joinPoint.getSignature().getModifiers()),
						map.get("repoClass"), map.get("rmethod"), map.get("entity"));// getMethodSignature(joinPoint);

				log.info(String.format(
						"htmlLog=><div style='%s' title='Class.method[Entity] line#%s'> <i class='fa fa-database'> %s</i></div>",
						css, lineNo, classMethod));
			}
			Object result = joinPoint.proceed();
			if (showLog) {
				// log.info(String.format(
				// "htmlLog=><div style='%s' title='Class.method[Entity] line#%s'> <i class='fa
				// fa-database'> %s</i></div>",
				// css, lineNo, classMethod));
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			return result;
		} catch (Exception e) {
			if (showLog) {
				log.info(String.format(
						"htmlLog=><div style='%s' title='Class.method[Entity] line#%s'><i class='fa fa-database'></i> <i class='fa fa-exclamation-triangle' style='color:red;'></i>  %s...err=%s</div>",
						css, lineNo, classMethod, e.getMessage()));
				paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
						false);
			}
			throw e;
		}

	}

	@Around("httpClientPointcut()")
	public Object logAroundHttpClient(ProceedingJoinPoint joinPoint) throws Throwable {

		String paddingLeft = "0";
		String css = null;
		String url = null;
		int lineNo = joinPoint.getSourceLocation().getLine();

		try {
			Object[] args = joinPoint.getArgs();
			if (args.length > 0)
				url = args[0].toString();
			paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) + paddingLeftIncr) + "",
					false);
			css = String.format("padding-left:%spx;color:%s", (paddingLeft), "#0000ff");
			log.info(String.format("htmlLog=><div style='%s'  title='API line#%s'><i class='fa fa-cloud'></i> %s</div>",
					css, lineNo, url));
			Object result = joinPoint.proceed();
			// log.info(String.format(
			// "htmlLog=><div style='%s' title='API line#%s'><i class='fa fa-cloud'></i>
			// %s</div>",
			// css, lineNo, url));

			paddingLeft = saveFile(pLeftFile, (Integer.parseInt(readFile(pLeftFile, false)) - paddingLeftIncr) + "",
					false);
			return result;
		} catch (Exception e) {
			log.info(String.format(
					"htmlLog=><div style='%s'  title='API line#%s'><i class='fa fa-cloud'></i> <i class='fa fa-exclamation-triangle' style='color:red;'></i> %s...err=%s</div>",
					css, lineNo, url, e.getMessage()));

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

	private List<String> exceptions = Arrays.asList("getIndex", "invoke");

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
			System.out.println(e);
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

		} catch (Exception fe) {
			System.out.println("File not found");
		}
		// if(allLines)
		// return lines.toString();

		return (lines != null && lines.size() > 0 && StringUtils.hasLength(lines.get(0))) ? (lines.get(0)) : "0";
	}
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
