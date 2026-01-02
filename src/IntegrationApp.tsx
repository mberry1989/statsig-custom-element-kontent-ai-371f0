import { StatsigExperiment } from "./components/StatsigExperiment.tsx";
import { CustomElementContext } from "./customElement/CustomElementContext.tsx";
import styles from "./IntegrationApp.module.css";

export const IntegrationApp = () => {
  return (
    <div className={styles.container}>
      <CustomElementContext height={400}>
        <StatsigExperiment />
      </CustomElementContext>
    </div>
  );
};

IntegrationApp.displayName = "IntegrationApp";
