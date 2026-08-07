package fr.immoscrapper;

import java.util.concurrent.Executor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class ImmoScrapperBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(ImmoScrapperBackApplication.class, args);
	}

	/**
	 * Un seul thread pour les estimations DVF : les téléchargements se font en
	 * série (politesse envers data.gouv.fr) sans jamais bloquer l'API.
	 */
	@Bean
	public Executor estimationExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(1);
		executor.setMaxPoolSize(1);
		executor.setQueueCapacity(500);
		executor.setThreadNamePrefix("estimation-");
		executor.initialize();
		return executor;
	}
}
