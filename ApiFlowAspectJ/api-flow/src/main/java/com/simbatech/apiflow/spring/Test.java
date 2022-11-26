package com.simbatech.apiflow.spring;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Test {

	@Autowired
	Test2 test;
	
	public void m1() {
		System.out.println(11);
		test.m1();
		m2();
	}	
	private void m2() {
		System.out.println("m2");
	}
	
}
