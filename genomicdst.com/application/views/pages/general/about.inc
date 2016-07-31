<script src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script>

<section class="about row">
	<div class="large-8 large-centered 
				columns callout large">

        <div class="row columns clearfix">
            <img src="<?=base_url( 'assets/images/upm_logo.png' )?>" class="about-logo float-left">
            <img src="<?=base_url( 'assets/images/dpsm_logo.png' )?>" class="about-logo float-right">

            <h4 class="text-center">
                 Privacy-preserving Genomic Disease Susceptibility Testing using Secure Multiparty Computation
            </h4>
        </div>
        
        <hr>
        
        <h6 class="row columns text-justify">
            This system is the undergraduate Special Problem of Joseph Niel Tuazon developed as 
            a partial fulfillment of the requirements for the degree of Bachelor of Science in 
            Computer Science at the University of the Philippines, Manila.
        </h6>
        
        <hr>
        
        <div class="row columns">
        
            
            
            <h5>
                <b>Genomic Disease Susceptibility Testing</b>
            </h5>
            
            <p>
                Genomic disease susceptibility testing is a method of checking the probability of 
                an individual to incur certain diseases through the use of the individual's genomic 
                data. The method used for this system is generally referred to as a <b>polygenic risk 
                score</b> calculation.
            </p>
            
            <p>
                A polygenic risk score of an individual can be calculated through the use of the 
                individual's SNPs (single nucleotide polymorphisms) and a disease marker provider's 
                set of causal SNPs for a particular disease. The method utilizes an additive model 
                defined as follows:
            </p>
            
            <p>
                $$\beta_{g_{i}} = \mu + \sum_{j \in C}z_{ij}u_{j}$$
            </p>
            
            <p>
                where \( \beta_{g_{i}} \) is the regression coefficient for the genomic risk
                of individual \( i \); \( \mu \) is the intercept of the current model; \( C \) is
                the set of causal SNPs of the disease marker provider; \( z_{ij} \) is the 
                genotypic value of individual \( i \)'s genotype when compared with the causal 
                SNP \( j \) such that \( z_{ij} \in \{0,1,2\} \); and \( u_{j} \) is the contribution 
                of the causal SNP \( j \) to the overall genomic risk.
            </p>
            
            <p>
                The overall risk of an individual, through the use of the risk coefficient obtained
                from this system and the individual's environmental and clinical data, can be computed 
                as follows:
            </p>
            
            <p>
                $$\beta_{f_{i}} = \mu + \beta_{g_{i}} + \beta_{e_{i}/c_{i}}$$
            </p>
            
            <p>
                where \( \beta_{f_{i}} \) is the overall regression coefficient for the disease risk
                of individual \( i \); \( \mu \) is the intercept of the current model; \( \beta_{g_{i}} \)
                is the genomic risk coefficient; \( \beta_{e_{i}/c_{i}} \) is the risk coefficient for the 
                clinical and environmental data.
            </p>
            
            <p>
                The overall probability of individual \( i \) of incurring a disease \( P_{i} \) using the 
                final risk coefficient can be calculated as follows:
            </p>
            
            <p>
                $$ P_{i} = \frac{e^{\beta_{f_{i}}}}{1 + e^{\beta_{f_{i}}}} $$
            </p>
            
            <h5>
                <b>Sharemind</b>
            </h5>
            
            <p>
                Sharemind is the secure multi-party computation framework used by this system in developing a
                web-based application that securely computes the genomic risk coefficient of an individual. 
                Sharemind works by having three servers (<em>miners</em>) perform the computation protocol.
            </p>
            
            <p>
                <img src="<?=base_url( 'assets/images/sharemind.png' )?>" class="about-sharemind">
            </p>
            
            <p>
                Data uploaded to the system by the users will stay private because no computation proceedure is
                done in the server. Only the client's browser and the three miners are computing for the risk 
                coefficient on an individual.
            </p>
            
        </div>
        
	</div>
</section>