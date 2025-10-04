import type { CodegenConfig } from '@graphql-codegen/cli';

// 실무 환경 설정 (Production-level GraphQL Codegen)
// https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-operations

const config: CodegenConfig = {
  overwrite: true,
  schema: './src/graphql/schema.graphql', // 로컬 스키마 (실무에서는 API 엔드포인트 사용)
  documents: './src/**/*.ts', // 모든 .ts 파일에서 GraphQL 쿼리 탐색
  config: {
    // 타입 최적화: 중복된 타입을 사전에 해결
    preResolveTypes: true,
    // 네이밍 컨벤션: 스키마 이름 그대로 유지
    namingConvention: 'keep',
    // Operation 접미사 제거 (GetTodosQuery -> GetTodos)
    omitOperationSuffix: true,
    // Optional 필드를 nullable로 처리 (실무 표준)
    avoidOptionals: {
      field: true,
    },
    // Root 타입에서 __typename 제거
    skipTypeNameForRoot: true,
    // 커스텀 Scalar 타입 매핑
    scalars: {
      Long: 'number',
      DateTime: 'string',
    },
  },
  generates: {
    './src/graphql/__generated__/graphqlType.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        {
          // 자동 생성 파일 표시 주석
          add: {
            content: `/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.`,
          },
        },
      ],
    },
  },
};

export default config;
