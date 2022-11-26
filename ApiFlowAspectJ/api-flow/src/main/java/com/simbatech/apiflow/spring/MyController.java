package com.simbatech.apiflow.spring;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MyController {

	@Autowired
	MyService myService;
	
	@GetMapping("/mapping")
	public void mapping() throws Exception {
		myService.mapping();
	}
	
	@GetMapping("/batchProcessing")
	public void batchProcessing() throws Exception {
		myService.batchProcessing();
	}
	
	@GetMapping("/txCheck")
	public void txCheck() throws Exception {
		myService.txCheck();
	}
	@GetMapping("/embededKey")
	public void embededKey() throws Exception {
		myService.embededKey();
	}
}
