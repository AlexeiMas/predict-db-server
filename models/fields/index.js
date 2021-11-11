const modelFields = {
  'Visible Externally': 1,
  'Model Status': 1,
  'Growth Characteristics': 1,
  '3D Model Status': 1,
  'Patient Sequential Models': 1,
  'Confirmed Protein Expression': 1,
  NGS: 1,
  'Tumour Mutation Burden Status': 1,
  'Microsatelite Status': 1,
  'Has Patient Treatment History': 1,
  'Has NGS Data': 1,
  'Has Growth Characteristics': 1,
  'PredictRx Case ID': 1,
  'Model ID': 1,
  hla: 1,
};

const copyNumbersFields = {
  'AnnotSV ID': 1,
  'SV chrom': 1,
  'SV start': 1,
  'SV end': 1,
  'SV length': 1,
  'SV type': 1,
  log2FC: 1,
  Qscore: 1,
  ObservedDepth: 1,
  ExpectedDepth: 1,
  Zscore: 1,
  HetVar: 1,
  IsCNV: 1,
  Length: 1,
  IsLOH_Only: 1,
  'Annotation mode': 1,
  Gene_name: 1,
  Tx: 1,
  'Model ID': 1,
};

const clinicalDataFields = {
  date_created: 1,
  'Growth Kinetics': 1,
  Sex: 1,
  Age: 1,
  Ethnicity: 1,
  'Primary Tumour Type': 1,
  'Tumour Sub-type': 1,
  'NIH MeSH Tree Number': 1,
  Diagnosis: 1,
  Stage: 1,
  Histology: 1,
  'Receptor Status': 1,
  Differentiation: 1,
  'Treatment Status': 1,
  'Sample Collection Site': 1,
  'Sample Type': 1,
  'Procedure Type': 1,
  'Smoking History': 1,
  'Clinical Biomarkers of Interest (non-immune)': 1,
  'Clinical Biomarkers of Interest (Immune)': 1,
  'PDC Model': 1,
  'Case ID': 1,
  PBMC: 1,
  Plasma: 1,
};

const mutationsFields = {
  Gene_refGene: 1,
  Existing_variation: 1,
  Protein_position: 1,
  Amino_acids: 1,
  Func_refGene: 1,
  ExonicFunc_refGene: 1,
  Chr: 1,
  Start: 1,
  End: 1,
  Ref: 1,
  Alt: 1,
  Zygosity: 1,
  AF: 1,
  Quality: 1,
  CurrentExon: 1,
  EnsGenID: 1,
  EnsTransID: 1,
  cosmic68: 1,
  gnomAD_genome_ALL: 1,
  'Model ID': 1,
};

const expressionsFields = {
  gene_id: 1,
  'Log TPM': 1,
  Percentile: 1,
  Zscore: 1,
  Symbol: 1,
  'Model ID': 1,
};

const fusionsFields = {
  'Gene_1_symbol(5end_fusion_partner)': 1,
  'Gene_2_symbol(3end_fusion_partner)': 1,
  Fusion_description: 1,
  Predicted_effect: 1,
  Fusion_sequence: 1,
  'Model ID': 1,
};

const treatmentResponsesFields = {
  Treatment: 1,
  'Response Percentile': 1,
  'Phenotypic Response Type': 1,
  'Treatment Type': 1,
  'Model ID': 1,
};

const treatmentHistoryFields = {
  'Pre/Post Collection': 1,
  Regime: 1,
  // 'Date Started': 1,            // remove-extra-fileds-columns(t12), requested by @albert.bezman
  'Dose  (mg/day or mg/kg)': 1, // TODO: Fix field name in the DB
  'Treatment Duration (Months)': 1,
  'Best Response (RECIST)': 1,
  'Response Duration (Months)': 1,
  Treatment: 1,
  // 'Date of Last Treatment': 1,  // remove-extra-fileds-columns(t12), requested by @albert.bezman
  'PredictRx Case ID': 1,
};

module.exports = {
  modelFields,
  copyNumbersFields,
  clinicalDataFields,
  mutationsFields,
  expressionsFields,
  fusionsFields,
  treatmentResponsesFields,
  treatmentHistoryFields,
};
