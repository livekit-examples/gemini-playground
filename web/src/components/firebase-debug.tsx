"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FirebaseDebug } from '@/utils/firebase-debug';

/**
 * Debug component to test Firebase connection
 * Add this temporarily to your page to test Firestore
 */
export function FirebaseDebugComponent() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      console.log('🧪 Starting Firebase debug test...');
      
      // Check environment
      const env = FirebaseDebug.checkEnvironment();
      console.log('🔧 Environment:', env);
      
      // Test connection
      const result = await FirebaseDebug.testConnection();
      console.log('📊 Test result:', result);
      
      // Test v8 syntax (should fail)
      const v8Result = await FirebaseDebug.testV8StyleQuery();
      console.log('📊 V8 test result:', v8Result);
      
      setTestResult({
        environment: env,
        connectionTest: result,
        v8Test: v8Result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('🔥 Debug test failed:', error);
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto m-4">
      <CardHeader>
        <CardTitle>Firebase Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={loading}>
          {loading ? 'Testing...' : 'Run Firebase Test'}
        </Button>
        
        {testResult && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Environment Variables:</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(testResult.environment, null, 2)}
              </pre>
            </div>
            
            {testResult.connectionTest && (
              <div>
                <h3 className="font-semibold mb-2">Connection Test:</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testResult.connectionTest, null, 2)}
                </pre>
              </div>
            )}
            
            {testResult.v8Test && (
              <div>
                <h3 className="font-semibold mb-2">V8 Syntax Test (should fail):</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testResult.v8Test, null, 2)}
                </pre>
              </div>
            )}
            
            {testResult.error && (
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Error:</h3>
                <pre className="bg-red-50 p-4 rounded text-sm overflow-x-auto text-red-800">
                  {testResult.error}
                </pre>
              </div>
            )}
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click "Run Firebase Test" to test your Firestore connection</li>
            <li>Check the browser console for detailed logs</li>
            <li>Make sure your .env.local file has all required Firebase variables</li>
            <li>Ensure your Firestore database exists and has proper security rules</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
