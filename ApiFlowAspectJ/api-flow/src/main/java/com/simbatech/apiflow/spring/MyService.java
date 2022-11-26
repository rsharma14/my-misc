package com.simbatech.apiflow.spring;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MyService {
//	@Autowired
//	OrderRepo orderRepo;
//	@Autowired
//	ProductRepo productRepo;
//	@Autowired
//	ProductPriceRepo productPriceRepo;
//	@PersistenceContext
//	EntityManager entityManager;
	@Autowired
	Test test;

//	@Transactional(rollbackFor  = Exception.class)
	public void mapping() throws Exception {
//		Order order = new Order();
//		order.setOrderDate(new Date());
//		order.setTransaction(new Transaction(new Date(), 11.0,order));
//		order.setOrderItems(Arrays.asList(new OrderItem(order),new OrderItem(order),new OrderItem(order)));
//	
//		productRepo.save(new Product(1,"P1"));
////		System.out.println(1/0);
////		System.out.println(new FileReader(new File("aa")));
//		orderRepo.save(order);

	}

//	@Transactional
	public void batchProcessing() {
		for(int i=0;i<100000;i++) {
			System.out.println("=="+i);
//			productRepo.save(new Product(1,"P"+i));
		}

		
	}
//	@Transactional
	//(rollbackFor  = Exception.class,propagation = Propagation.REQUIRES_NEW)
	public void txCheck() {
		txCheck1();
		test.m1();
		Employee e=new Employee();
		e.setName("");

		
	}
//	@Transactional
	//(rollbackFor  = Exception.class,propagation = Propagation.REQUIRES_NEW)
	public void txCheck3() {
		txCheck1();
		txCheck2();
		
	}
	//@Transactional//(rollbackFor  = Exception.class,propagation = Propagation.REQUIRES_NEW)
	public void txCheck1() {
		System.out.println("txCheck1");
//		productPriceRepo.save(new ProductPrice(1,1.1));
		test.m1();
		test.m1();

//		System.out.println(1/0);
//		productRepo.save(new Product(1,"P1"));

//		txCheck2();
//		System.out.println(1/0);

		
	}
//	@Transactional(rollbackFor  = Exception.class,propagation = Propagation.REQUIRES_NEW)
	public void txCheck2() {
//		productRepo.save(new Product(1,"P1"));
		System.out.println(1/0);
//		System.out.println(new FileReader(new File("aa")));

	}

//	@Transactional
	public void embededKey() {
//		entityManager.persist(new EmbededTable(new EmbededKey(1, 2), "PP"));		
	}

}
