package com.simbatech.apiflow.spring;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.BeanNameAware;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.web.context.ServletContextAware;

public class SpringBeanLC implements InitializingBean, DisposableBean, BeanNameAware ,ServletContextAware{

	@Override
	public void afterPropertiesSet() throws Exception {
		System.out.println("afterPropertiesSet");
	}

	@Override
	public void destroy() throws Exception {
		System.out.println("destroy");

	}

	@Override
	public void setBeanName(String name) {
		System.out.println("destroy"+name);
		
	}

	@Override
	public void setServletContext(ServletContext servletContext) {
		System.out.println("ServletContext"+servletContext);
		
	}

}
