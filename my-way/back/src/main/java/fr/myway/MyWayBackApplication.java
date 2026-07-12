package fr.myway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MyWayBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyWayBackApplication.class, args);
	}

}
