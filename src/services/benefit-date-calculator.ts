interface RetiredBenefitData {
  gender: string;
  birth_date: Date;
  contribution_time: string;
}

export class BenefitDateCalculatorService {
  static calculateBenefitDate(data: RetiredBenefitData): Date | null {
    try {
      const birthDate = new Date(data.birth_date);
      const contributionYears = parseInt(data.contribution_time);

      if (isNaN(contributionYears)) {
        return null;
      }

      const currentYear = new Date().getFullYear();
      const age = currentYear - birthDate.getFullYear();

      let requiredAge: number;
      let requiredContribution: number;

      if (data.gender === "feminino") {
        // Mulheres
        requiredAge = 62;
        requiredContribution = 15;
      } else {
        // Homens
        requiredAge = 65;
        requiredContribution = 20;
      }

      // Calcular quando a pessoa atingirá os requisitos
      const yearsUntilAge = Math.max(0, requiredAge - age);
      const yearsUntilContribution = Math.max(
        0,
        requiredContribution - contributionYears
      );

      // A data de concessão será quando atingir ambos os requisitos
      const yearsToWait = Math.max(yearsUntilAge, yearsUntilContribution);

      // Se já atende aos requisitos
      if (yearsToWait === 0) {
        return new Date(); // Pode solicitar agora
      }

      // Calcular data futura
      const benefitDate = new Date();
      benefitDate.setFullYear(benefitDate.getFullYear() + yearsToWait);

      return benefitDate;
    } catch (error) {
      console.error("Erro ao calcular data do benefício:", error);
      return null;
    }
  }
}
