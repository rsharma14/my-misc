package com.simbatech.apiflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
//@EnableSwagger2
public class ApiFlowApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiFlowApplication.class, args);
	}

	
	/*
	 * @Bean public Docket api() { return new
	 * Docket(DocumentationType.SWAGGER_2).select().apis(RequestHandlerSelectors.
	 * basePackage("com"))
	 * .paths(PathSelectors.regex("/.*")).build().apiInfo(apiEndPointsInfo()); }
	 * 
	 * private ApiInfo apiEndPointsInfo() { return new
	 * ApiInfoBuilder().title("Spring Boot REST API").description("REST API").
	 * license("Apache 2.0")
	 * .licenseUrl("http://www.apache.org/licenses/LICENSE-2.0.html").version(
	 * "1.0.0").build(); }
	 */
}
